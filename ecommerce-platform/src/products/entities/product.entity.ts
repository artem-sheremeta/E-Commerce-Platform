import { CartItem } from 'src/cart/entities/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the product',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Wireless Mouse',
    description: 'Name of the product',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'A high-quality wireless mouse with ergonomic design.',
    description: 'Detailed description of the product',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'Category of the product',
  })
  @Column()
  category: string;

  @ApiProperty({
    example: 49.99,
    description: 'Price of the product',
  })
  @Column('decimal')
  price: number;

  @ApiProperty({
    description: 'Optional image URL for the product',
    example: '/uploads/product-image.jpg',
  })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({
    example: 100,
    description: 'Quantity of the product in stock',
  })
  @Column('int')
  quantity: number;

  @ApiProperty({
    description: 'The seller who listed the product',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.products, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ApiProperty({
    example: false,
    description: 'Whether the product is marked as deleted',
  })
  @Column({ default: false })
  isDeleted: boolean;

  @ApiProperty({
    description: 'List of cart items associated with this product',
    type: () => [CartItem],
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cart: CartItem[];

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Date when the product was created',
  })
  @CreateDateColumn()
  createAt: Date;
}
