import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [AdminController],
})
export class AdminModule { }
