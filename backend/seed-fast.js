const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const { categories, subcategories } = require('./dist/db/schema');

async function main() {
  const connection = await mysql.createConnection('mysql://sql12822041:mLe7SFQUKZ@sql12.freesqldatabase.com:3306/sql12822041');
  const db = drizzle(connection);
  
  try {
    const catsToSeed = [
      { name: 'Full Furniture', subs: ['Living Room Sets', 'Bedroom Sets'] },
      { name: 'Living Room', subs: ['Sofas', 'Recliners', 'Coffee Tables', 'TV Stands'] },
      { name: 'Bed Room', subs: ['Beds', 'Wardrobes', 'Nightstands', 'Dressers'] },
      { name: 'Dining', subs: ['Dining Sets', 'Dining Tables', 'Dining Chairs', 'Cabinets'] },
      { name: 'Collection', subs: ['New Arrivals', 'Best Sellers', 'Classic Collection'] }
    ];

    for (const cat of catsToSeed) {
      const [res] = await db.insert(categories).values({ name: cat.name });
      const catId = res.insertId;
      
      const subsToInsert = cat.subs.map(subName => ({
        name: subName,
        categoryId: catId
      }));
      
      await db.insert(subcategories).values(subsToInsert);
      console.log(`Inserted category: ${cat.name} with ${subsToInsert.length} subcategories`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

main();
