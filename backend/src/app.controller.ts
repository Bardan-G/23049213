import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('DRIZZLE') private db: MySql2Database<typeof schema>,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('promote-admin')
  async promoteToAdmin(@Query('email') email: string) {
    if (!email) return "Email required";
    try {
      await this.db.update(schema.users)
        .set({ role: 'admin' })
        .where(eq(schema.users.email, email));
      return `User ${email} promoted to admin successfully.`;
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }
}
