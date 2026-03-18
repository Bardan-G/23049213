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
  ) { }

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

    // Auto-promote specific user to admin (Temporary Fix for Deployment)
    if (email === 'grihalaxmifurniture6@gmail.com' && user.role !== 'admin') {
      console.log(`Auto-promoting ${email} to admin...`);
      await this.db.update(schema.users)
        .set({ role: 'admin' })
        .where(eq(schema.users.email, email));
      user.role = 'admin'; // Update local object for token
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async googleLogin(profile: any) {
    const { email, name, image } = profile;

    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      // Create user if not exists
      // Using a random strong password since they'll login via Google
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const insertData = {
        email,
        password: hashedPassword,
        name,
        role: email === 'grihalaxmifurniture6@gmail.com' ? 'admin' : 'customer' // Auto-promote special user
      };

      const [result] = await this.db.insert(schema.users).values(insertData);

      user = {
        id: result.insertId,
        email,
        name,
        password: hashedPassword,
        role: insertData.role,
      } as any;
    } else {
      // Auto-promote specific user to admin even on subsequent logins via Google
      if (email === 'grihalaxmifurniture6@gmail.com' && user!.role !== 'admin') {
        console.log(`Auto-promoting ${email} to admin...`);
        await this.db.update(schema.users)
          .set({ role: 'admin' })
          .where(eq(schema.users.email, email));
        user!.role = 'admin'; // Update local object for token
      }
    }

    const payload = { sub: user!.id, email: user!.email, role: user!.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role }
    };
  }
}