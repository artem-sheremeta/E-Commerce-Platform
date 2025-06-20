import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or Username used to log in',
    example: 'user123 or user@example.com',
  })
  @IsNotEmpty({ message: 'Email or Username is required' })
  @IsString()
  login: string;

  @ApiProperty({
    description: 'Password used to log in',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
