import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: MySql2Database<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, pass: string, name: string) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(pass, 10);
    await this.db.insert(schema.users).values({ email, password: hashedPassword, name });
    
    return { success: true };
  }

  async login(email: string, pass: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}