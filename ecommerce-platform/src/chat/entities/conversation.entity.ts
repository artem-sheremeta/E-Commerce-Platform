import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Message } from './message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  ManyToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Conversation {
  @ApiProperty({
    description: 'Unique identifier of the conversation',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  // @ApiProperty({
  //   type: () => [User],
  //   description: 'Users participating in the conversation',
  // })
  @ApiHideProperty()
  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable()
  participants: User[];

  @ApiProperty({
    type: () => [Message],
    description: 'List of messages in the conversation',
  })
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @ApiProperty({
    description: 'Timestamp when the conversation was created',
    example: '2025-05-27T14:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the conversation was last updated',
    example: '2025-05-27T15:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
