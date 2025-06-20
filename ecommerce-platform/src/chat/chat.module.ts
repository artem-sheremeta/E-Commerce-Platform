import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { ChatGateway } from './strategy/chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Conversation])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
