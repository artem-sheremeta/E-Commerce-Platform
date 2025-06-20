import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders/entities/order.entity';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';
import { CartModule } from './cart/cart.module';
import * as cors from 'cors';
import { CartItem } from './cart/entities/cart.entity';
import { ConfigModule } from '@nestjs/config';
import { Message } from './chat/entities/message.entity';
import { Conversation } from './chat/entities/conversation.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      // host: 'localhost',
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // database: 'postgres',
      entities: [User, Product, Order, CartItem, Message, Conversation],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    ChatModule,
    AdminModule,
    OrdersModule,
    CartModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cors({
          origin: 'http://localhost:5173',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          credentials: true,
        }),
      )
      .forRoutes('*');
  }
}
