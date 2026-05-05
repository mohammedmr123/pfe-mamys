const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function seedStats() {
  try {
    console.log('Seeding servers and historical orders...');

    // 1. Create Servers (Users)
    const usersRes = await pool.query(`
      INSERT INTO users (username, password_hash, role) VALUES 
      ('Amine', 'hashed_pass', 'CASHIER'),
      ('Sarah', 'hashed_pass', 'CASHIER'),
      ('Marc', 'hashed_pass', 'CASHIER')
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `);
    
    let userIds = usersRes.rows.map(u => u.id);
    if (userIds.length === 0) {
      const existingUsers = await pool.query("SELECT id FROM users WHERE role = 'CASHIER'");
      userIds = existingUsers.rows.map(u => u.id);
    }

    // 2. Get some products
    const prodRes = await pool.query('SELECT id, price FROM products LIMIT 5');
    const products = prodRes.rows;

    if (products.length === 0) {
      console.log('Please seed products first!');
      return;
    }

    // 3. Insert Historical Orders (last 30 days)
    console.log('Inserting historical orders...');
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const totalAmount = (Math.random() * 50 + 10).toFixed(2);
      const paymentMethod = Math.random() > 0.5 ? 'CASH' : 'CARD';
      const createdAt = `NOW() - INTERVAL '${daysAgo} days' - INTERVAL '${Math.floor(Math.random() * 12)} hours'`;

      const orderRes = await pool.query(`
        INSERT INTO orders (user_id, total_amount, status, payment_method, created_at)
        VALUES ($1, $2, 'PAID', $3, ${createdAt})
        RETURNING id
      `, [userId, totalAmount, paymentMethod]);

      const orderId = orderRes.rows[0].id;

      // Add 1-3 items per order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        await pool.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES ($1, $2, $3, $4)
        `, [orderId, product.id, qty, product.price]);
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during seeding stats:', err);
  } finally {
    await pool.end();
  }
}

seedStats();
