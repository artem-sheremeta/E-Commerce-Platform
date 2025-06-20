import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async createProduct(
    productData: CreateProductDto,
    user: User,
  ): Promise<Product> {
    const id = await this.userService.findByUsername(user.username);
    const product = this.productRepository.create({
      ...productData,
      seller: id,
    });

    return await this.productRepository.save(product);
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { isDeleted: false },
    });
    return plainToInstance(Product, products);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return plainToInstance(Product, product);
  }

  async updateProduct(
    id: number,
    productData: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (product.seller.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    Object.assign(product, productData);

    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number, user: User): Promise<void> {
    const product = await this.getProductById(id);

    if (product.seller.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    product.isDeleted = true;
    await this.productRepository.save(product);
  }

  async getSellerProducts(sellerId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { seller: { id: sellerId }, isDeleted: false },
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: [
        { name: ILike(`%${query}`), isDeleted: false },
        { description: ILike(`%${query}%`), isDeleted: false },
      ],
    });

    return plainToInstance(Product, products);
  }
}
