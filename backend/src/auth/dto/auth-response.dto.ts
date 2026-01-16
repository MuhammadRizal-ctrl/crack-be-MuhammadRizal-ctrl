import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'student@example.com' })
  email: string;

  @ApiProperty({ example: 'John Student' })
  fullName: string;

  @ApiProperty({ example: 'student', enum: ['student', 'instructor', 'admin'] })
  role: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

