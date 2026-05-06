import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust to your frontend URL in production
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<number, string>(); // userId -> socketId

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            // Extract JWT from query or headers
            const token = client.handshake.query.token as string || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                // If there's no token, we shouldn't disconnect right away because other namespaces might use the connection.
                // But for this app, we ONLY use auth chats. It's safer to just return without adding them to connectedUsers.
                console.log(`Client connected without token: ${client.id}`);
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            const userId = Number(payload.sub);
            this.connectedUsers.set(userId, client.id);
            console.log(`Client authenticated: ${client.id}, userId: ${userId}`);

            // If admin, they could join an "admins" room for broadcasting
            if (payload.role === 'admin') {
                client.join('admins');
            }
        } catch (e) {
            console.log(`Connection auth failed for ${client.id}:`, e.message);
            // Don't forcefully disconnect to avoid frontend loop reconnects until we handle tokens more gracefully later
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === client.id) {
                this.connectedUsers.delete(userId);
                console.log(`Client disconnected: ${client.id}, userId: ${userId}`);
                break;
            }
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() payload: { receiverId: number; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = this.getUserIdFromSocket(client);
        if (!senderId) return;

        // Save message to database
        const message = await this.chatService.saveMessage(senderId, payload.receiverId, payload.content);

        // Send to receiver if online
        const receiverIdNum = Number(payload.receiverId);
        const receiverSocketId = this.connectedUsers.get(receiverIdNum);
        
        // Use a single chained 'to()' call so Socket.IO handles deduplication 
        // if the receiver happens to also be in the 'admins' room.
        let broadcast = this.server.to('admins');
        if (receiverSocketId) {
            broadcast = broadcast.to(receiverSocketId);
        }
        
        broadcast.emit('newMessage', message);

        // Send back to sender to confirm
        client.emit('messageSent', message);
    }

    private getUserIdFromSocket(client: Socket): number | null {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === client.id) {
                return userId;
            }
        }
        return null;
    }
}
