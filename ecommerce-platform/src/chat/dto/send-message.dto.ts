import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID of the conversation to which the message is sent',
    example: 5,
  })
  @IsNumber()
  conversationId: number;

  @ApiProperty({
    description: 'Text content of the message',
    example: 'Hi, is the item still available?',
  })
  @IsString()
  content: string;
}
