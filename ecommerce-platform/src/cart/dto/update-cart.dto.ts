import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity of the cart item',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
