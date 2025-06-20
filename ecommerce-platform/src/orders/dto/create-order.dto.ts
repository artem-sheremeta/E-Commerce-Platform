import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from '@nestjs/class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'First name of the customer',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({
    description: 'Last name of the customer',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Phone number of the customer',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Shipping address of the customer',
    example: '123 Main St, Apt 4B, New York, NY',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  shipping_address: string;

  @ApiProperty({
    description: 'City of the customer',
    example: 'New York',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Postal code of the customer',
    example: '10001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  postal_code: string;

  @ApiProperty({
    description: 'Country of the customer',
    example: 'USA',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    description: 'Current status of the order',
    example: 'PENDING',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Current payment status of the order',
    example: 'PAID',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}
