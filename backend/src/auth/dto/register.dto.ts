import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newstudent@example.com',
    default: 'newstudent@example.com',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    default: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Student',
    default: 'John Student',
    minLength: 2,
  })
  @IsString({ message: 'fullName must be a string' })
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  fullName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.student,
    default: UserRole.student,
  })
  @IsEnum(UserRole, {
    message: 'role must be one of: student, instructor, admin',
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Passionate learner exploring web development',
    default: 'Passionate learner exploring web development',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}

