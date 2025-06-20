import { IsString, IsNotEmpty, IsEnum } from '@nestjs/class-validator';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status of the order',
    example: 'completed',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
