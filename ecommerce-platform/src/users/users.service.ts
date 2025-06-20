import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findByUsernameOrEmail(login: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: [{ username: login }, { email: login }],
    });
  }

  async findAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return plainToInstance(User, users);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return plainToInstance(User, user);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return plainToInstance(User, user);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return plainToInstance(User, user);
  }

  async findAndDeleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateUser(id: number, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateData.password) {
      updateData.password = await this.authService.hashPassword(
        updateData.password,
      );
    }

    Object.assign(user, updateData);

    return await this.userRepository.save(user);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    let password = userData.password;

    if (!password) {
      password = await this.authService.hashPassword(
        Math.random().toString(36).slice(-8),
      );
    } else {
      password = await this.authService.hashPassword(password);
    }

    const newUser = this.userRepository.create({
      ...userData,
      password,
    });

    return await this.userRepository.save(newUser);
  }

  async findAdmin(): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { role: 'admin' },
      select: ['id', 'username'],
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async createWithGoogle(data: {
    email: string;
    username: string;
    role: 'customer' | 'seller' | 'admin';
  }): Promise<User> {
    const newUser = this.userRepository.create({
      email: data.email,
      username: data.username,
      role: data.role,
      password: '', // google users do not have password
    });
    return await this.userRepository.save(newUser);
  }
}
