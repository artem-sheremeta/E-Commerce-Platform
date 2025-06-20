import {
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'The name of the product',
    example: 'Updated Gaming Laptop',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the product',
    example: 'Upgraded gaming laptop with 32GB RAM and RTX 4070.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The price of the product in USD',
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'The category the product belongs to',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Number of items available in stock',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Optional image URL for the product',
    example: '/uploads/updated-image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl: string;
}
