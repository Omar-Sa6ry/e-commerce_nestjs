import { Module } from '@nestjs/common'
import { WebSocketMessageGateway } from './websocket.gateway'

@Module({
  providers: [WebSocketMessageGateway],
  exports: [WebSocketMessageGateway],
})
export class WebSocketModule {}
