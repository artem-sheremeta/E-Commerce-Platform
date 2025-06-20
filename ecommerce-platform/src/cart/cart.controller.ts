import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CartItem } from './entities/cart.entity';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiResponse({
    status: 201,
    description: 'Product added to cart',
    type: CartItem,
  })
  @ApiBody({
    description: 'Product ID to add to the cart',
    type: CreateCartDto,
  })
  async addToCart(
    @Body() createCartDto: CreateCartDto,
    @Req() req,
  ): Promise<CartItem> {
    const userId = req.user.id;
    const { productId } = createCartDto;
    return await this.cartService.addToCart(userId, productId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cart items for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of cart items',
    type: [CartItem],
  })
  async getCart(@Req() req): Promise<CartItem[]> {
    return this.cartService.getCartItems(req.user.id);
  }

  @Patch(':id/update-quantity')
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  @ApiParam({ name: 'id', description: 'Cart item ID', example: 1 })
  @ApiBody({
    description: 'New quantity value for the cart item',
    type: UpdateCartItemDto,
  })
  async updateCartItemQuantity(
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req,
  ): Promise<CartItem> {
    return await this.cartService.updateCartItemQuantity(
      id,
      req.user.id,
      updateCartItemDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({ status: 200, description: 'Cart item removed' })
  async removeFromCart(@Param('id') cartItemId: number, @Req() req) {
    return this.cartService.removeFromCart(cartItemId, req.user.id);
  }
}
