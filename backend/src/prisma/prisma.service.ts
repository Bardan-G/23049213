import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client'


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      connectionLimit: 5,
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
