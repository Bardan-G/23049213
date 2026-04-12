const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const { products, productVariants, productImages } = require('./dist/db/schema');

async function main() {
  const connection = await mysql.createConnection('mysql://sql12822041:mLe7SFQUKZ@sql12.freesqldatabase.com:3306/sql12822041');
  const db = drizzle(connection);
  
  const data = {
    name: "Test Sofa",
    description: "A comfortable sofa",
    price: "499.99",
    stock: 10,
    subcategoryId: 1, // Need to make sure this subcategory exists? Let's use null if possible, or check if it throws foreign key constraint. Wait, let's check what subcategories exist.
    imageUrl: "https://example.com/sofa.jpg",
    images: ["https://example.com/sofa.jpg", "https://example.com/sofa2.jpg"],
    model3dUrl: null
  };

  const { variants, images, ...productData } = data;

  try {
    await db.transaction(async (tx) => {
      const [insertResult] = await tx.insert(products).values(productData);
      const productId = insertResult.insertId;

      if (images && Array.isArray(images) && images.length > 0) {
        const imagesToInsert = images.map(url => ({
          imageUrl: url,
          productId: productId
        }));
        await tx.insert(productImages).values(imagesToInsert);
      }
      console.log("Success! Product ID:", productId);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}
main();
