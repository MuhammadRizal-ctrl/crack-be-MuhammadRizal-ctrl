import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

