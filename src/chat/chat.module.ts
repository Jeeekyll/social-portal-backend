import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomService } from '../room/room.service';
import { ConnectedUserService } from '../connectedUser/connected-user.service';
import { JoinedRoomService } from '../joinedRoom/joined-room.service';
import { MessageService } from '../message/message.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from '../room/room.entity';
import { ConnectedUserEntity } from '../connectedUser/connected-user.entity';
import { MessageEntity } from '../message/message.entity';
import { JoinedRoomEntity } from '../joinedRoom/joined-room.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity,
      UserEntity,
    ]),
  ],
  providers: [
    ChatGateway,
    RoomService,
    ConnectedUserService,
    JoinedRoomService,
    MessageService,
  ],
})
export class ChatModule {}
