import { forwardRef, Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), forwardRef(() => UsersModule)],
  providers: [ProductsService],
  exports: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
