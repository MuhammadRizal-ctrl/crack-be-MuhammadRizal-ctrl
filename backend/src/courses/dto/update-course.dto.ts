import { IsString, IsEnum, IsOptional, IsInt, IsArray, Min } from 'class-validator';
import { CourseDifficulty, CourseStatus } from '@prisma/client';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsArray()
  prerequisites?: string[];
}

