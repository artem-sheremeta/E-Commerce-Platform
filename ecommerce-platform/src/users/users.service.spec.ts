import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto, UserRole } from 'src/auth/dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockUserWithPassword: CreateUserDto = {
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.CUSTOMER,
    password: 'plainpassword',
  };

  const mockUserWithoutPassword = {
    username: 'nopass',
    email: 'nopass@example.com',
    role: UserRole.SELLER,
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    authService = {
      hashPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserById', () => {
    it('should return user if found by ID', async () => {
      const fakeUser = { id: 1, username: 'john' } as User;
      userRepository.findOne?.mockResolvedValue(fakeUser);

      const result = await service.findUserById(1);

      expect(result).toEqual(fakeUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne!.mockResolvedValue(undefined);
      await expect(service.findUserById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should hash provided password and save new user', async () => {
      authService.hashPassword!.mockResolvedValue('hashed123');
      userRepository.create!.mockReturnValue({
        ...(mockUserWithPassword as User),
        password: 'hashed123',
      });
      userRepository.save!.mockResolvedValue({
        id: 1,
        ...(mockUserWithPassword as User),
        password: 'hashed123',
      });

      const result = await service.createUser(mockUserWithPassword);

      expect(authService.hashPassword).toHaveBeenCalledWith('plainpassword');
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockUserWithPassword,
        password: 'hashed123',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUserWithPassword,
        password: 'hashed123',
      });
      expect(result).toEqual({
        id: 1,
        ...mockUserWithPassword,
        password: 'hashed123',
      });
    });

    it('should generate and hash random password if not provided', async () => {
      const generatedPassword = 'generated';
      const hashedGenerated = 'hashedRandom123';

      const mathSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456789); // predictable result

      authService.hashPassword!.mockResolvedValue(hashedGenerated);
      userRepository.create!.mockReturnValue({
        ...(mockUserWithoutPassword as User),
        password: hashedGenerated,
      });
      userRepository.save!.mockResolvedValue({
        id: 2,
        ...(mockUserWithoutPassword as User),
        password: hashedGenerated,
      });

      const result = await service.createUser(mockUserWithoutPassword as any);

      expect(authService.hashPassword).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockUserWithoutPassword,
        password: hashedGenerated,
      });
      expect(result).toEqual({
        id: 2,
        ...mockUserWithoutPassword,
        password: hashedGenerated,
      });

      mathSpy.mockRestore(); // cleanup
    });
  });
});
