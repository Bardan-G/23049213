// backend/src/db/db.module.ts
import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';

@Global() // This makes the database available everywhere without re-importing!
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: async () => {
        const connection = await mysql.createConnection({
          host: 'localhost',
          user: 'smart_furn',
          password: 'password123', // Use your actual password from docker-compose
          database: 'smart_furn_db',
        });
        return drizzle(connection, { schema, mode: 'default' });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DbModule {}