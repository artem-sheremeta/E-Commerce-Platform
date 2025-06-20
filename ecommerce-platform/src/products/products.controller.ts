import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/strategy/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'Validation error in the request body.',
  })
  @ApiBody({
    description: 'Product creation details',
    type: CreateProductDto,
    examples: {
      loginExample: {
        summary: 'Example Product Creation',
        value: {
          name: 'Gaming Laptop',
          description: 'High-end gaming laptop with 16GB RAM and RTX 3060.',
          price: 1500,
          category: 'Electronics',
          quantity: 10,
        },
      },
    },
  })
  async createProduct(
    @UploadedFile() image: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    if (image) {
      createProductDto.imageUrl = `/uploads/${image.filename}`;
    }

    const user = req.user;
    return this.productsService.createProduct(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all products.',
    type: [Product],
  })
  async getAllProducts(): Promise<Product[]> {
    return this.productsService.getAllProducts();
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller', 'admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product', type: Number })
  @ApiBody({
    description: 'Payload for updating a product',
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async updateProduct(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateData: UpdateProductDto,
    @Req() req,
  ) {
    if (image) {
      updateData.imageUrl = `/uploads/${image.filename}`;
    }
    return await this.productsService.updateProduct(id, updateData, req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller', 'admin')
  @Patch('delete/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully soft deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async deleteProduct(@Param('id') id: number, @Req() req): Promise<void> {
    return this.productsService.deleteProduct(id, req.user);
  }

  @Get('seller/:id')
  @ApiOperation({ summary: 'Get all products by seller ID' })
  @ApiParam({ name: 'id', description: 'The ID of the seller', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of products by the specified seller.',
    type: [Product],
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  async getSellerProducts(@Param('id') id: number): Promise<Product[]> {
    return await this.productsService.getSellerProducts(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({
    name: 'query',
    description: 'Search query string',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of products matching the search query.',
    type: [Product],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchProducts(
    @Query() queryDto: SearchProductDto,
  ): Promise<Product[]> {
    const { query } = queryDto;
    return await this.productsService.searchProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns the product details.',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async getProductById(@Param('id') id: number): Promise<Product> {
    return await this.productsService.getProductById(id);
  }
}
