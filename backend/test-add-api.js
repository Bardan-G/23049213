const jwt = require('jsonwebtoken');

async function testApi() {
  const token = jwt.sign({ sub: 1, email: 'grihalaxmifurniture6@gmail.com', role: 'admin' }, 'Super_Secret_Key_12345', { expiresIn: '1h' });
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log("Creating category...");
    let catRes = await fetch('http://localhost:10000/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Furniture Test' })
    });
    let catData = await catRes.json();
    console.log("Category:", catData);
    let catId = (catData.insertId !== undefined) ? catData.insertId : catData.id;

    console.log("Creating subcategory...");
    let subRes = await fetch('http://localhost:10000/categories/sub', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Sofas Test', categoryId: catId })
    });
    let subData = await subRes.json();
    console.log("Subcategory:", subData);
    let subId = (subData.insertId !== undefined) ? subData.insertId : subData.id;

    console.log("Adding product...");
    const payload = {
      name: "Test Sofa API",
      description: "A comfortable sofa",
      price: "499.99",
      stock: 10,
      subcategoryId: subId,
      imageUrl: "https://example.com/sofa.jpg",
      images: ["https://example.com/sofa.jpg", "https://example.com/sofa2.jpg"],
      model3dUrl: null
    };

    let prodRes = await fetch('http://localhost:10000/products/add', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    let prodData = await prodRes.json();
    console.log("Product status:", prodRes.status);
    console.log("Product response:", prodData);

  } catch (err) {
    console.error(err);
  }
}

testApi();
