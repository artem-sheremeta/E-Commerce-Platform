import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from 'src/cart/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, CartItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
