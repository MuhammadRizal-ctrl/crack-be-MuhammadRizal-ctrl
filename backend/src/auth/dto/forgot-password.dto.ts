import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@example.com',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;
}

