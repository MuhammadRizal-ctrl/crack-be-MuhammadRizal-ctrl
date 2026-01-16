import { Controller, Post, Body, Get, UseGuards, Request, Query, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account. All fields are required except bio.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      student: {
        summary: 'Register as Student',
        value: {
          email: 'newstudent@example.com',
          password: 'password123',
          fullName: 'John Student',
          role: 'student',
          bio: 'Passionate learner exploring web development',
        },
      },
      instructor: {
        summary: 'Register as Instructor',
        value: {
          email: 'newinstructor@example.com',
          password: 'password123',
          fullName: 'Jane Instructor',
          role: 'instructor',
          bio: 'Experienced full-stack developer and educator',
        },
      },
      admin: {
        summary: 'Register as Admin',
        value: {
          email: 'newadmin@example.com',
          password: 'password123',
          fullName: 'Admin User',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - check the errors array for details',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns JWT tokens.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      student: {
        summary: 'Login as Student',
        value: {
          email: 'student@example.com',
          password: 'password123',
        },
      },
      instructor: {
        summary: 'Login as Instructor',
        value: {
          email: 'instructor@example.com',
          password: 'password123',
        },
      },
      admin: {
        summary: 'Login as Admin',
        value: {
          email: 'admin@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLWhlcmUiLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTY0MDYwNDgwMH0.example',
          description: 'JWT refresh token',
        },
      },
      required: ['refreshToken'],
    },
    examples: {
      default: {
        summary: 'Refresh Token Example',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLWhlcmUiLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTY0MDYwNDgwMH0.example',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMe(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  async logout() {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token. For token blacklisting, you'd need Redis.
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if account exists)',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent (if account exists)',
  })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with tokens
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  async githubAuth() {
    // Guard redirects to GitHub
    // Note: Will fail if GitHub credentials not configured
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
    }
    
    const result = await this.authService.oauthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with tokens
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}`,
    );
  }
}

