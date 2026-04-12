const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection('mysql://sql12822041:mLe7SFQUKZ@sql12.freesqldatabase.com:3306/sql12822041');
  
  try {
    const catsToSeed = [
      { name: 'Full Furniture', subs: ['Living Room Sets', 'Bedroom Sets'] },
      { name: 'Living Room', subs: ['Sofas', 'Recliners', 'Coffee Tables', 'TV Stands'] },
      { name: 'Bed Room', subs: ['Beds', 'Wardrobes', 'Nightstands', 'Dressers'] },
      { name: 'Dining', subs: ['Dining Sets', 'Dining Tables', 'Dining Chairs', 'Cabinets'] },
      { name: 'Collection', subs: ['New Arrivals', 'Best Sellers', 'Classic Collection'] }
    ];

    for (const cat of catsToSeed) {
      const [res] = await connection.query('INSERT INTO categories (name) VALUES (?)', [cat.name]);
      const catId = res.insertId;
      
      for (const subName of cat.subs) {
        await connection.query('INSERT INTO subcategories (name, category_id) VALUES (?, ?)', [subName, catId]);
      }
      console.log(`Inserted category: ${cat.name} with ${cat.subs.length} subcategories`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

main();
