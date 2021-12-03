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
    console.log('connected');
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    console.log('user disconnected');

    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    this.server.emit('disconnected', 'User disconnected');

    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('sendUser')
  async sendUser(socket: Socket, data) {
    const user = await this.userService.findById(data.id);
    if (!user) {
      return socket.disconnect();
    }

    return this.server.emit('getUser', user);
  }

  @SubscribeMessage('createRoom')
  async createRoom(socket: Socket, room) {
    const createdRoom = await this.roomService.create(room, socket.data.user);
    return socket.emit('getCreatedRoom', createdRoom);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, { user, roomId }) {
    console.log('roomid', roomId);

    socket.join(`room/${roomId}`);
    const room = await this.roomService.findOne(roomId);

    const joinedRoom = await this.joinedRoomService.create({
      socketId: socket.id,
      user,
      room,
    });

    console.log(joinedRoom);
    // const messages = await this.messageService.findMessagesForRoom(room);
    // await this.joinedRoomService.create({
    //   socketId: socket.id,
    //   user: socket.data.user,
    //   room,
    // });

    // await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message) {
    const createdMessage: any = await this.messageService.create(message);
    const room = this.roomService.findOne(createdMessage.room.id);
    // const joinedUsers = await this.joinedRoomService.findByRoom(room);

    this.server.emit('getMessage', {
      ...createdMessage,
      ...room,
    });
  }

  async findCurrentUser(socket: Socket): Promise<UserEntity> {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const decode = verify(token, JWT_SECRET);
    return await this.userService.findById(decode.id);
  }
}
