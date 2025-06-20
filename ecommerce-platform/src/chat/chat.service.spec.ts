import { User } from 'src/users/entities/user.entity';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

const mockQueryBuilder: any = {
  leftJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(null),
};

describe('ChatService', () => {
  let service: ChatService;
  let conversationRepository: jest.Mocked<Partial<Repository<Conversation>>>;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let messageRepository: jest.Mocked<Partial<Repository<Message>>>;
  beforeEach(async () => {
    conversationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };
    userRepository = {
      findOne: jest.fn(),
    };

    messageRepository = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: conversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startConservation', () => {
    it('should create a new conversation if not exists', async () => {
      const mockSender = {
        id: 1,
      } as User;

      const mockReceiver = {
        id: 2,
      } as User;
      const mockConversation = {
        id: 10,
        participants: [mockSender, mockReceiver],
      } as Conversation;
      userRepository.findOne!.mockResolvedValueOnce(mockSender);
      userRepository.findOne!.mockResolvedValueOnce(mockReceiver);
      conversationRepository.find!.mockResolvedValue([]);
      conversationRepository.create!.mockReturnValue(mockConversation);
      conversationRepository.save!.mockResolvedValue(mockConversation);

      const result = await service.startConversation(
        mockSender.id,
        mockReceiver.id,
      );

      expect(result).toEqual(mockConversation);
      expect(conversationRepository.create).toHaveBeenCalledWith({
        participants: [mockSender, mockReceiver],
      });
      expect(conversationRepository.save).toHaveBeenCalledWith(
        mockConversation,
      );
    });
  });
});
