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
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JWT_SECRET } from '../config';
import { verify } from 'jsonwebtoken';
import { UserEntity } from '../user/user.entity';

@WebSocketGateway(4000, { cors: { origin: ['http://localhost:3000'] } })
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

  async handleConnection(socket: Socket) {
    try {
      const user = await this.findCurrentUser(socket);

      if (!user) {
        return this.disconnect(socket);
      }

      socket.data.user = user;
      const rooms = await this.roomService.getRoomsForUsers(user.id);
      await this.connectedUserService.create({ socketId: socket.id, user });
      this.server.emit('welcome', `User connected, ${user.email}`);
      // return this.server.to(socket.id).emit('rooms', rooms);
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    this.server.emit('disconnected', 'User disconnected');

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
      await this.server.to(user.socketId).emit(' ', createdMessage);
    }
  }

  async findCurrentUser(socket: Socket): Promise<UserEntity> {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const decode = verify(token, JWT_SECRET);
    return await this.userService.findById(decode.id);
  }
}
