// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', //frontend
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: { conversationId: number; senderId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(
      data.conversationId,
      data.senderId,
      data.content,
    );

    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('message', message);
  }

  @SubscribeMessage('joinConversation')
  handleJoinRoom(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation-${data.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveRoom(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation-${data.conversationId}`);
  }
}
