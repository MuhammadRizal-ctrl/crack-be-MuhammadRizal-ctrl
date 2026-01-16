import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

