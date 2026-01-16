import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitChallengeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: string;
}

