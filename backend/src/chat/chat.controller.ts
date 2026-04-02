import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('chat')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('history/:otherUserId')
    async getHistory(@Request() req, @Param('otherUserId') otherUserId: string) {
        const userId = Number(req.user.userId);
        return this.chatService.getChatHistory(userId, parseInt(otherUserId));
    }

    // Endpoint for customers to get the admin's ID to start a chat
    @Get('admin-id')
    async getAdminId() {
        const admin = await this.chatService.getAdminUser();
        return { adminId: admin?.id || null };
    }

    @Roles('admin')
    @Get('active-chats')
    async getActiveChats() {
        return this.chatService.getActiveChats();
    }
}
