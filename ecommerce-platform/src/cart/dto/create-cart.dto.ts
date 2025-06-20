import { IsNotEmpty, IsNumber, IsPositive } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  productId: number;
}
