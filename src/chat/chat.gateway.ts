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
import { OnModuleInit } from '@nestjs/common';
import { JWT_SECRET } from '../config';
import { verify } from 'jsonwebtoken';
import { UserEntity } from '../user/user.entity';

@WebSocketGateway(4000, {
  cors: { origin: ['http://localhost:3000'] },
})
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

  async handleConnection() {
    console.log('User connect!');
  }

  async handleDisconnect() {
    this.server.emit('CLIENT@ROOM:LEAVE', {
      text: 'User disconnected',
    });
  }

  @SubscribeMessage('SERVER@ROOM:JOIN')
  async joinRoom(socket: Socket, { roomId }) {
    socket.join(`room/${roomId}`);
  }

  @SubscribeMessage('SERVER@MESSAGE:CREATE')
  async onAddMessage(socket: Socket, payload) {
    const newMessage = await this.messageService.create(payload);
    const roomById = await this.roomService.findOne(payload.room.id);

    this.server.to('room/' + roomById.id).emit('CLIENT@MESSAGE:GET', {
      ...newMessage,
    });
  }

  async findCurrentUser(socket: Socket): Promise<UserEntity> {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const decode = verify(token, JWT_SECRET);
    return await this.userService.findById(decode.id);
  }
}
