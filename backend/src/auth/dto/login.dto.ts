import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@example.com',
    default: 'student@example.com',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    default: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password: string;
}

