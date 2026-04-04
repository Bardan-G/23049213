import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: async () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined in environment variables');
        }

        // Use a Pool for better stability in production
        const pool = mysql.createPool({
          uri: connectionString,
          connectionLimit: 5, // Important for Free SQL Database limits
          waitForConnections: true,
          queueLimit: 0,
        });

        return drizzle(pool, { schema, mode: 'default' });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DbModule {}