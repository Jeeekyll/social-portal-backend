import { WebSocketGateway } from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../src/user/guards/auth.guard';
import { User } from '../src/user/decorators/user.decorator';

@WebSocketGateway(4000, { cors: ['http://localhost:3000'] })
export class WebsocketGateway implements NestGateway {
  afterInit(server: any) {
    console.log('Init');
  }

  public handleDisconnect(socket: any): void {
    console.log('disconnected');
  }

  @UseGuards(AuthGuard)
  public handleConnection(socket: any, @User() currentUser): void {
    console.log(
      'connected',
      socket.handshake.headers.authorization,
      currentUser,
    );
  }
}
