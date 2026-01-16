import { IsString, IsOptional, IsInt, IsArray, IsBoolean, Min } from 'class-validator';

export class CreateRoadmapDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @IsArray()
  items: any[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

