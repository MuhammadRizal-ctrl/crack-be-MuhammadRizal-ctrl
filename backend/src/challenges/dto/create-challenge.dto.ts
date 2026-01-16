import { IsString, IsEnum, IsOptional, IsInt, IsArray, Min } from 'class-validator';
import { ChallengeDifficulty } from '@prisma/client';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  starterCode?: string;

  @IsString()
  solution: string;

  @IsArray()
  testCases: any[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  memoryLimit?: number;
}

