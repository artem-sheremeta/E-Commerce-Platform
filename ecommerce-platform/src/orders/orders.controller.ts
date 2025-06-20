import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/strategy/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
    type: Order,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Login is required to create an order.',
  })
  @ApiBody({
    description: 'Order creation details',
    type: CreateOrderDto,
    examples: {
      example: {
        summary: 'Create an order example',
        value: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '123456789',
          shipping_address: '123 Main Street',
          city: 'Metropolis',
          postal_code: '12345',
          country: 'USA',
          productId: 2,
          quantity: 2,
          status: 'pending',
          total_price: 59.98,
          payment_status: 'pending',
          cartItems: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
          ],
        },
      },
    },
  })
  async createOrder(
    @Req() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const userId = req.user.id;
    return await this.orderService.createOrder(userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders.',
    type: [Order],
  })
  async getAllOrders(): Promise<Order[]> {
    return await this.orderService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details fetched successfully.',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  async getOrderById(@Param('id') id: number, @Req() req): Promise<Order> {
    const userId = req.user.id;
    const userRole = req.user.role;
    return await this.orderService.getOrderById(id, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all orders for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders for the user.',
    type: [Order],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no orders available.',
  })
  async getUserOrders(@Param('userId') userId: number): Promise<Order[]> {
    return this.orderService.getUserOrders(userId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of an order (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully.',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @ApiBody({
    description: 'Update order status details',
    type: UpdateOrderStatusDto,
    examples: {
      loginExample: {
        summary: 'Example for updating order status', // Valid values: 'pending', 'completed', 'canceled', 'shipped'
        value: {
          status: 'completed',
        },
      },
    },
  })
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.orderService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order by ID (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  async deleteOrder(@Param('id') id: number, @Req() req): Promise<void> {
    const userId = req.user.id;
    const userRole = req.user.role;
    return await this.orderService.deleteOrder(id, userId, userRole);
  }
}
