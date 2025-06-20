import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  // @ApiProperty({
  //   type: () => Conversation,
  //   description: 'Conversation this message belongs to',
  // })
  @ApiHideProperty()
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ApiProperty({
    type: () => User,
    description: 'User who sent the message',
  })
  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how can I help you?',
  })
  @Column('text')
  content: string;

  @ApiProperty({
    description: 'Timestamp of when the message was sent',
    example: '2024-05-27T12:34:56.789Z',
  })
  @CreateDateColumn()
  sentAt: Date;
}
