import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';

export interface BroadcastDto {
  subject: string;
  html: string;
  role?: 'admin' | 'seller' | 'customer';
}

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(userDoc: CreateUserDto): Promise<any> {
    const allowedRoles = ['seller', 'customer'];
    if (!allowedRoles.includes(userDoc.role)) {
      throw new BadRequestException('Invalid role selected.');
    }

    const userEmail = await this.userService.findByEmail(userDoc.email);
    if (userEmail) throw new ConflictException('Email already exists.');

    const userUsername = await this.userService.findByUsername(
      userDoc.username,
    );
    if (userUsername) throw new ConflictException('Username already exists');

    await this.userService.createUser(userDoc);
    return {
      statusCode: '201',
      message: 'User created successfully',
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { login, password } = loginDto;

    if (!login || !password) {
      throw new UnauthorizedException('Login and password are required.');
    }

    const userSearch = await this.userService.findByUsernameOrEmail(login);
    if (!userSearch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userSearch.isBanned) {
      throw new ForbiddenException('User is banned');
    }

    const isPasswordValid = await this.validatePassword(
      password,
      userSearch.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = {
      userId: userSearch.id,
      username: userSearch.username,
      role: userSearch.role,
      email: userSearch.email,
    };

    return { access_token: this.jwtService.sign(user), user };
  }

  async validateUser(login: string, password: string): Promise<any> {
    const user = await this.userService.findByUsernameOrEmail(login);
    if (user && (await this.validatePassword(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendResetPasswordEmail(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const resetCode = this.generateResetCode();

    const token = this.jwtService.sign(
      { email, resetCode },
      { secret: process.env.JWT_SECRET, expiresIn: '10m' },
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return token;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send reset email.');
    }
  }

  async resetPassword(
    token: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.resetCode !== code) {
        throw new BadRequestException('Invalid reset code');
      }

      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.password = await this.hashPassword(newPassword);
      await this.userRepository.save(user);

      console.log(`Password reset successfully for ${payload.email}`);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset code/token');
    }
  }

  async validateGoogleUser(googleUser: any) {
    const existingUser = await this.userService.findByEmail(googleUser.email);

    if (existingUser) {
      const token = this.jwtService.sign({
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
      return {
        access_token: token,
        user: existingUser,
      };
    }

    const newUser = await this.userService.createUser({
      username: googleUser.name || googleUser.email.split('@')[0],
      email: googleUser.email,
      password: Math.random().toString(36).slice(-8), //generate fake password
      role: UserRole.CUSTOMER,
    });

    const token = this.jwtService.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      access_token: token,
      user: newUser,
    };
  }

  //auto email spam
  @Cron('0 12 * * *')
  async handleCron() {
    this.logger.log('⏰ Automatic email newsletter launched');
    const users = await this.userRepository.find({
      where: { role: 'customer' },
    });
    const subject = '📢 Новини магазину';
    const html = this.buildNewsletterTemplate();

    for (const user of users) {
      await this.sendEmail(user.email, subject, html);
    }
  }

  private async sendEmail(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Failed to send email to ${email}`);
    }
  }

  private buildNewsletterTemplate(): string {
    return `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2 style="color: #2c3e50;">🛒 Вітаємо у нашому магазині!</h2>
          <p>Ми підготували нові пропозиції для вас.</p>
          <ul>
            <li>🔹 Знижки до 30%</li>
            <li>🔹 Нові товари</li>
            <li>🔹 Безкоштовна доставка</li>
          </ul>
          <p style="margin-top: 20px;">Завітайте на наш сайт 👇</p>
          <a href="http://localhost:3000" style="color: #3498db;">Перейти в магазин</a>
        </div>
      `;
  }
}
