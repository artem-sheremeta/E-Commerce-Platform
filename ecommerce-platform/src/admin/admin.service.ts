import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async banUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = true;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Code',
      html: `
        <p>Your account has been blocked!</strong></p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
    return await this.userRepository.save(user);
  }

  async unbanUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = false;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Code',
      html: `
        <p>Your account has been unblocked!</strong></p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
    return await this.userRepository.save(user);
  }
}
