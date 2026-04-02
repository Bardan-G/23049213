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
        // 1. Prioritize the Environment Variable from Render
        // 2. Fallback to local Docker/XAMPP for your MacBook
        const connectionString = process.env.DATABASE_URL || "mysql://smart_furn:password123@127.0.0.1:3306/smart_furn_db";
        
        console.log('Connecting to database...');

        try {
          const connection = await mysql.createConnection(connectionString);
          console.log('Successfully connected to the database! 🎉');
          return drizzle(connection, { schema, mode: 'default' });
        } catch (error) {
          console.error('Database connection failed:', error.message);
          throw error;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DbModule {}