import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from './guard/google-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login endpoint' })
  @ApiResponse({
    status: 302,
    description: 'Redirects user to Google for authentication',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if Google login fails',
  })
  async googleAuth(@Req() req) {
    // Redirect handled by Passport strategy
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  @ApiOperation({ summary: 'Google OAuth redirect endpoint' })
  @ApiResponse({
    status: 302,
    description: 'Redirects user to frontend with token and user data',
  })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { access_token, user } = await this.authService.validateGoogleUser(
      req.user,
    );

    const redirectUrl = new URL('http://localhost:5173');
    redirectUrl.searchParams.set('token', access_token);
    redirectUrl.searchParams.set('username', user.username);
    redirectUrl.searchParams.set('role', user.role);

    return res.redirect(redirectUrl.toString());
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    description: 'User login details',
    type: LoginDto,
    examples: {
      loginExample: {
        summary: 'Example Login',
        value: {
          login: 'username or email',
          password: 'password123',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({
    description: 'User registration details',
    type: CreateUserDto,
    examples: {
      registerExample: {
        summary: 'Example Registration',
        value: {
          username: 'user123',
          email: 'john.doe@example.com',
          password: 'password123',
          role: 'seller or customer',
        },
      },
    },
  })
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 201,
    description: 'Reset code sent successfully to your email.',
  })
  @ApiResponse({ status: 400, description: 'Email not found' })
  @ApiBody({
    description: 'Request password reset by email',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'john.doe@example.com',
        },
      },
    },
  })
  async requestPasswordReset(@Body('email') email: string) {
    const token = await this.authService.sendResetPasswordEmail(email);
    return { message: 'Reset code sent successfully to your email.', token };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 201,
    description: 'Password reset successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid reset token or code' })
  @ApiBody({
    description: 'Reset password with token and new password',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'reset-token-123',
        },
        code: {
          type: 'string',
          example: '123456',
        },
        newPassword: {
          type: 'string',
          example: 'newPassword123',
        },
      },
    },
  })
  async resetPassword(
    @Body() body: { token: string; code: string; newPassword: string },
  ) {
    const { token, code, newPassword } = body;
    await this.authService.resetPassword(token, code, newPassword);
    return { message: 'Password reset successfully.' };
  }
}
