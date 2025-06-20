import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserRole } from 'src/auth/dto/create-user.dto';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/strategy/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('block/:userId')
  @ApiOperation({ summary: 'Block a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been blocked successfully.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async blockUser(@Param('userId') userId: number): Promise<User> {
    return await this.adminService.banUser(userId);
  }

  @Patch('unblock/:userId')
  @ApiOperation({ summary: 'Unblock a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been unblocked successfully.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async unblockUser(@Param('userId') userId: number): Promise<User> {
    return await this.adminService.unbanUser(userId);
  }
}
