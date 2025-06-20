import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, PaymentStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartItem } from 'src/cart/entities/cart.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const cartItems = await this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const items = cartItems.map((cartItem) => ({
      productId: cartItem.product.id,
      productName: cartItem.product.name,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
    }));

    const order = this.orderRepository.create({
      user: { id: userId },
      ...createOrderDto,
      items,
    });

    cartItems.forEach((cartItem) => {
      if (cartItem.product.quantity < cartItem.quantity) {
        throw new BadRequestException(
          `Not enough stock for product ${cartItem.product.name}`,
        );
      }
      cartItem.product.quantity -= cartItem.quantity;
    });

    await this.productRepository.save(cartItems.map((item) => item.product));
    await this.cartItemRepository.remove(cartItems);

    return await this.orderRepository.save(order);
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await this.orderRepository.find();
    return plainToInstance(Order, orders);
  }

  async getOrderById(
    orderId: number,
    userId: number,
    userRole: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.user.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You do not have access to view this order');
    }

    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
    });
    return plainToInstance(Order, orders);
  }

  async updateOrderStatus(
    orderId: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.getOrderById(orderId, 0, 'admin');
    order.status = updateOrderStatusDto.status;
    return await this.orderRepository.save(order);
  }

  async deleteOrder(
    orderId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const order = await this.getOrderById(orderId, userId, userRole);

    if (order.user.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You do not have access to view this order');
    }

    await this.orderRepository.remove(order);
  }
}
