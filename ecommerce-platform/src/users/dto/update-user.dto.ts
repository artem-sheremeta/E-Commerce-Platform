import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    description: 'The updated email address of the user',
    example: 'newuser@example.com',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The new password for the user',
    example: 'newSecurePassword123!',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The updated username for the user',
    example: 'newUsername',
  })
  username?: string;
}
