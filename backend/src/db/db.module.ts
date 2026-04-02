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
        // This line is the fix: It uses the Render URL if available
        const connectionString = process.env.DATABASE_URL || "mysql://smart_furn:password123@127.0.0.1:3306/smart_furn_db";
        
        const connection = await mysql.createConnection(connectionString);
        return drizzle(connection, { schema, mode: 'default' });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DbModule {}