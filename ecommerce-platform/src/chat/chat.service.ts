import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async startConversation(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Unable to create a chat with yourself');
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new NotFoundException('Users do not found ');
    }

    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('participant.id = :senderId OR participant.id = :receiverId', {
        senderId,
        receiverId,
      })
      .groupBy('conversation.id')
      .having('COUNT(DISTINCT participant.id) = 2')
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationRepository.create({
      participants: [sender, receiver],
    });

    return await this.conversationRepository.save(conversation);
  }

  async sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const message = this.messageRepository.create({
      conversation,
      sender,
      content,
    });

    const savedMessage = await this.messageRepository.save(message);

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
    });
    return plainToInstance(Message, messages);
  }

  async getUserConversations(userId: number) {
    const conversations = await this.conversationRepository.find({
      relations: ['participants', 'messages'],
      order: { updatedAt: 'DESC' },
    });

    const userConversations = conversations.filter((conv) =>
      conv.participants.some((p) => p.id === userId),
    );

    return userConversations.map((conv) => {
      const otherUser = conv.participants.find((p) => p.id !== userId);

      const lastMsg = conv.messages.length
        ? conv.messages[conv.messages.length - 1]
        : null;

      return {
        id: conv.id,
        otherUser: otherUser
          ? { id: otherUser.id, username: otherUser.username }
          : null,
        lastMessage: lastMsg?.content || '',
        lastDate: lastMsg?.sentAt || conv.updatedAt,
      };
    });
  }
}
