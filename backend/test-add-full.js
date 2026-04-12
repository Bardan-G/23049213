const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const { products, productVariants, productImages, categories, subcategories } = require('./dist/db/schema');

async function main() {
  const connection = await mysql.createConnection('mysql://sql12822041:mLe7SFQUKZ@sql12.freesqldatabase.com:3306/sql12822041');
  const db = drizzle(connection);
  
  try {
    const [catRes] = await db.insert(categories).values({ name: 'Furniture' });
    const catId = catRes.insertId;
    
    const [subRes] = await db.insert(subcategories).values({ name: 'Sofas', categoryId: catId });
    const subId = subRes.insertId;

    const [prodRes] = await db.insert(products).values({
        name: "Test Sofa 2",
        description: "A comfortable sofa",
        price: "499.99",
        stock: 10,
        subcategoryId: subId,
        imageUrl: "https://example.com/sofa.jpg",
        model3dUrl: null
    });
    const prodId = prodRes.insertId;
    
    console.log("Product Inserted:", prodId);
    
    await db.insert(productImages).values([
        { imageUrl: "https://example.com/sofa.jpg", productId: prodId },
        { imageUrl: "https://example.com/sofa2.jpg", productId: prodId }
    ]);
    console.log("Images Inserted!");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}
main();
