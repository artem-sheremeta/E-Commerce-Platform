import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from './entities/user.entity';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/strategy/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile.',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getProfile(@Req() req: any) {
    return this.userService.findByEmail(req.user.email);
  }

  @Get('role/admin')
  @ApiOperation({ summary: 'Get admin user info' })
  @ApiResponse({
    status: 200,
    description: 'Returns admin user (id and username).',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        username: { type: 'string', example: 'admin' },
      },
    },
  })
  async getAdmin(): Promise<{ id: number; username: string }> {
    return await this.userService.findAdmin();
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users.',
    type: [User],
  })
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to fetch',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Details of the requested user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.findUserById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.findAndDeleteUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to update',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user data.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async updateUser(
    @Param('id') id: number,
    @Body() updateData: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateData);
  }
}
