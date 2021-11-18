import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
