const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:10000/auth/login', { email: 'premdeep@gmail.com', password: 'password123' });
    const token = loginRes.data.accessToken;
    console.log("Logged in");
    const res = await axios.post('http://localhost:10000/orders', {
      items: [{ productId: 1, quantity: 1, price: 100 }],
      total: 100,
      address: "abc, def, 123",
      paymentMethod: "esewa"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch(e) {
    if (e.response) {
       console.error("HTTP ERROR:", e.response.status, e.response.data);
    } else {
       console.error("UNKNOWN ERROR:", e.message);
    }
  }
}
test();
