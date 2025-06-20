import { forwardRef, Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
