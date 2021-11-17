import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { ConnectedUserService } from '../connectedUser/connected-user.service';
import { JoinedRoomService } from '../joinedRoom/joined-room.service';
import { MessageService } from '../message/message.service';
import { OnModuleInit, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';

@WebSocketGateway({ cors: { origin: ['http://localhost:3000'] } })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService,
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  @UseGuards(AuthGuard)
  async handleConnection(socket: Socket, @User('id') userId: number) {
    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        return this.disconnect(socket);
      }

      socket.data.user = user;
      const rooms = await this.roomService.getRoomsForUsers(user.id);
      await this.connectedUserService.create({ socketId: socket.id, user });
      return this.server.to(socket.id).emit('rooms', rooms);
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room) {
    const messages = await this.messageService.findMessagesForRoom(room);
    await this.joinedRoomService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message) {
    const createdMessage: any = await this.messageService.create({
      ...message,
      user: socket.data.user,
    });
    const room = this.roomService.findOne(createdMessage.room.id);
    const joinedUsers = await this.joinedRoomService.findByRoom(room);

    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }
}
