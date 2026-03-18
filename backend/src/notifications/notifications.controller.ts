import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getMyNotifications(@Req() req: any) {
        if (req.user?.role === 'admin') {
            return this.notificationsService.getAdminNotifications();
        }
        return this.notificationsService.getUserNotifications(req.user.userId);
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(Number(id));
    }
}
