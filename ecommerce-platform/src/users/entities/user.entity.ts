import { CartItem } from 'src/cart/entities/cart.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Message } from 'src/chat/entities/message.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'johndoe', description: 'Username of the user' })
  @Column()
  username: string;

  @ApiProperty({
    example: 'securepassword123',
    description: 'Password for the user (write-only)',
    writeOnly: true,
  })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'customer',
    description: 'Role of the user',
  })
  @Column()
  role: 'admin' | 'seller' | 'customer';

  @ApiProperty({
    example: false,
    description: 'Whether the user is banned or not',
  })
  @Column({ default: false })
  isBanned: boolean;

  @ApiProperty({
    type: () => [Product],
    description: 'List of products created by the seller',
    required: false,
  })
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @ApiProperty({
    type: () => [Order],
    description: 'List of orders created by the user',
    required: false,
  })
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ApiProperty({
    type: () => [CartItem],
    description: 'Items in the user’s cart',
    required: false,
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cart: CartItem[];

  @ApiHideProperty()
  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @ApiHideProperty()
  @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  conversations: Conversation[];

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Date when the user was created',
  })
  @CreateDateColumn()
  createAt: Date;
}
