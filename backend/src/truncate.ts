import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE product_variants;');
    await connection.query('TRUNCATE TABLE order_items;');
    await connection.query('TRUNCATE TABLE cart_items;');
    await connection.query('TRUNCATE TABLE products;');
    await connection.query('TRUNCATE TABLE subcategories;');
    await connection.query('TRUNCATE TABLE categories;');
    await connection.query('TRUNCATE TABLE orders;');
    await connection.query('TRUNCATE TABLE notifications;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    await connection.end();
    console.log("Truncated tables successfully");
}
main();
