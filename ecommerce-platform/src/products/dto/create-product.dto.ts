import { IsString, IsNumber, IsPositive } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Gaming Laptop',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example: 'High-end gaming laptop with 16GB RAM and RTX 3060.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The price of the product in USD',
    example: 1500,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Optional image URL for the product',
    example: '/uploads/product-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: 'The category the product belongs to',
    example: 'Electronics',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Number of items available in stock',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;
}
