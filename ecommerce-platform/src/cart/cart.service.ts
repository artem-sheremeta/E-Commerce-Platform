import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productService: ProductsService,
  ) {}

  async addToCart(userId: number, productId: number): Promise<CartItem> {
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (cartItem) {
      throw new BadRequestException('Product is already in the cart');
    }

    cartItem = this.cartRepository.create({
      user: { id: userId },
      product,
      quantity: 1,
    });

    return this.cartRepository.save(cartItem);
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    const carts = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    return plainToInstance(CartItem, carts);
  }

  async updateCartItemQuantity(
    cartItemId: number,
    userId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, user: { id: userId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = updateCartItemDto.quantity;

    return await this.cartRepository.save(cartItem);
  }

  async removeFromCart(cartItemId: number, userId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, user: { id: userId } },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }
}
