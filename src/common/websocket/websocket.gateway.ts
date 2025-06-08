import { Server, Socket } from 'socket.io'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'

@WebSocketGateway({ namespace: '/messages' })
export class WebSocketMessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private connectedClients: Map<string, Socket> = new Map()

  handleConnection (client: Socket): void {
    const userId = client.handshake.query.userId as string
    if (userId) {
      this.connectedClients.set(userId, client)
      console.log(`Client connected: ${userId}`)
    }
  }

  handleDisconnect (client: Socket): void {
    const userId = Array.from(this.connectedClients.entries()).find(
      ([, socket]) => socket.id === client.id,
    )?.[0]

    if (userId) {
      this.connectedClients.delete(userId)
      console.log(`Client disconnected: ${userId}`)
    }
  }

  sendMessageToUser (userId: string, event: string, message: any): void {
    const client = this.connectedClients.get(userId)
    if (client) {
      client.emit(event, message)
    }
  }

  broadcast (event: string, message: any): void {
    this.server.emit(event, message)
  }
}
