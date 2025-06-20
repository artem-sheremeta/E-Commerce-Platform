import { Product } from 'src/products/entities/product.entity';
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

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  SHIPPED = 'shipped',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity()
export class Order {
  @ApiProperty({ example: 1, description: 'Unique identifier for the order' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User who placed the order',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: 'pending',
    description: 'Current status of the order',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({
    example: 'pending',
    description: 'Current payment status of the order',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @ApiProperty({ example: 'John', description: 'First name of the customer' })
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the customer' })
  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the customer',
  })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer',
  })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'Shipping address for the order',
  })
  @Column({ type: 'varchar', length: 255 })
  shipping_address: string;

  @ApiProperty({
    example: 'New York',
    description: 'City for the shipping address',
  })
  @Column({ type: 'varchar', length: 100 })
  city: string;

  @ApiProperty({
    example: '10001',
    description: 'Postal code for the shipping address',
  })
  @Column({ type: 'varchar', length: 100 })
  postal_code: string;

  @ApiProperty({
    example: 'USA',
    description: 'Country for the shipping address',
  })
  @Column({ type: 'varchar', length: 100 })
  country: string;

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Date when the order was created',
  })
  @CreateDateColumn()
  createAt: Date;

  @ApiProperty({
    example: '2023-01-05T12:00:00Z',
    description: 'Date when the order was shipped',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @ApiProperty({
    description: 'List of items in the order',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: {
          type: 'number',
          example: 1,
        },
        productName: {
          type: 'string',
          example: 'Wireless Mouse',
        },
        price: {
          type: 'number',
          example: 49.99,
        },
        quantity: {
          type: 'number',
          example: 2,
        },
      },
    },
  })
  @Column('json')
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }[];
}
