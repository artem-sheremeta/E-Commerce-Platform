import { IsEmail, IsIn, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'user123',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'securePassword123',
    // required: false,
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'Role of the user (customer, seller)',
    example: UserRole.CUSTOMER,
    enum: UserRole,
  })
  @IsIn(Object.values(UserRole))
  readonly role: UserRole;
}
