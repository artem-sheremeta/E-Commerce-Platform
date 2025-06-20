import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CartItem {
  @ApiProperty({ example: 1, description: 'Cart item ID' })
  @PrimaryGeneratedColumn()
  id: number;

  // @ApiProperty({ example: 1, description: 'User ID' })
  @ManyToOne(() => User, (user) => user.cart, { eager: false })
  user: User;

  // @ApiProperty({ example: 1, description: 'Product ID' })
  @ManyToOne(() => Product, (product) => product.cart, { eager: false })
  product: Product;

  @ApiProperty({ example: 2, description: 'Quantity of the product in cart' })
  @Column({ default: 1 })
  quantity: number;

  @ApiProperty({
    example: '2024-02-06T12:34:56.789Z',
    description: 'Date when item was added to cart',
  })
  @CreateDateColumn()
  createAt: Date;
}
