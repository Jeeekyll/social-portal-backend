import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('send_message')
  @UseGuards(AuthGuard)
  async listenForMessage(
    @MessageBody() content: string,
    @ConnectedSocket() socket: Socket,
    @User('id') authorId,
  ) {
    const author = await this.userService.findById(authorId);
    const message = await this.chatService.saveMessage(content, author);

    this.server.sockets.emit('receive_message', {
      author,
      content,
    });
  }

  @SubscribeMessage('request_all_messages')
  @UseGuards(AuthGuard)
  async requestAllMessages(@ConnectedSocket() socket: Socket) {
    const messages = await this.chatService.getAllMessages();

    socket.emit('send_all_messages', messages);
  }
}
