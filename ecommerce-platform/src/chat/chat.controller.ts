import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations/start')
  @ApiOperation({ summary: 'Start or get existing conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation started or retrieved',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        senderId: { type: 'number', example: 3 },
        receiverId: { type: 'number', example: 1 },
      },
    },
  })
  async startConversation(
    @Body() body: { senderId: number; receiverId: number },
  ) {
    const { senderId, receiverId } = body;
    return await this.chatService.startConversation(senderId, receiverId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, description: 'List of user conversations' })
  async getUserConversations(@Req() req) {
    const userId = req.user.id;
    return await this.chatService.getUserConversations(userId);
  }

  @Get('messages/:conversationId')
  @ApiOperation({ summary: 'Get all messages from a conversation' })
  @ApiParam({ name: 'conversationId', type: Number, example: 5 })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(@Param('conversationId') id: number) {
    return await this.chatService.getMessages(id);
  }

  @Post('messages/send')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(@Body() body: SendMessageDto, @Req() req) {
    return this.chatService.sendMessage(
      body.conversationId,
      req.user.id,
      body.content,
    );
  }
}
