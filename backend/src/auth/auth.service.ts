import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, role, bio } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        bio,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Store verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Send verification email (async, don't wait)
    this.emailService.sendVerificationEmail(user.email, verificationToken).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    // Send welcome email (async, don't wait)
    this.emailService.sendWelcomeEmail(user.email, user.fullName).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    return {
      user,
      ...tokens,
      emailVerificationRequired: true,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.validateUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      token: accessToken,
      refreshToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Invalidate old reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Find token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    // Check if already used
    if (resetToken.used) {
      throw new BadRequestException('This reset token has already been used');
    }

    // Check if expired
    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return {
      message: 'Password reset successfully',
    };
  }

  async oauthLogin(oauthUser: {
    oauthId: string;
    oauthProvider: string;
    email: string;
    fullName: string;
    avatar?: string;
  }) {
    const userSelect = {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatar: true,
      createdAt: true,
    };

    // Check if user exists by OAuth ID
    let user = await this.prisma.user.findFirst({
      where: {
        oauthProvider: oauthUser.oauthProvider,
        oauthId: oauthUser.oauthId,
      },
      select: userSelect,
    });

    // If not found, check by email
    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      // If user exists but no OAuth, link the account
      if (existingUser) {
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            oauthProvider: oauthUser.oauthProvider,
            oauthId: oauthUser.oauthId,
            avatar: oauthUser.avatar || existingUser.avatar,
            emailVerified: true, // OAuth emails are pre-verified
            emailVerifiedAt: new Date(),
          },
          select: userSelect,
        });
      }
    }

    // Create new user if doesn't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          fullName: oauthUser.fullName,
          passwordHash: '', // No password for OAuth users
          role: 'student',
          avatar: oauthUser.avatar,
          oauthProvider: oauthUser.oauthProvider,
          oauthId: oauthUser.oauthId,
          emailVerified: true, // OAuth emails are pre-verified
          emailVerifiedAt: new Date(),
        },
        select: userSelect,
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    // Find token
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check if already used
    if (verificationToken.used) {
      throw new BadRequestException('This verification token has already been used');
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    // Update user email as verified
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark token as used
    await this.prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    return {
      message: 'Email verified successfully',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        emailVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return {
        message: 'If an account with that email exists, a verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate old tokens
    await this.prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store new token
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'If an account with that email exists, a verification email has been sent.',
    };
  }
}

