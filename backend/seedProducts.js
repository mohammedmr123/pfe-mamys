const { Pool } = require('pg');
require('dotenv').config(); // Load from backend/.env

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function seed() {
  try {
    console.log('Vérification des catégories...');
    const catRes = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catRes.rows[0].count, 10) === 0) {
      console.log('Insertion des catégories...');
      await pool.query(`
        INSERT INTO categories (id, name) VALUES 
        (1, 'Burgers'),
        (2, 'Boissons'),
        (3, 'Desserts')
      `);
      // Update sequence
      await pool.query("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))");
    }

    console.log('Vérification des produits...');
    const prodRes = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRes.rows[0].count, 10) === 0) {
      console.log('Insertion des produits...');
      await pool.query(`
        INSERT INTO products (id, name, price, category_id, image_url) VALUES 
        (1, 'Classic Burger', 8.50, 1, '🍔'),
        (2, 'Cheese Burger', 9.50, 1, '🍔'),
        (3, 'Coca Cola', 2.50, 2, '🥤'),
        (4, 'Fanta', 2.50, 2, '🥤'),
        (5, 'Tiramisu', 4.50, 3, '🍰'),
        (6, 'Glace', 3.50, 3, '🍦')
      `);
      // Update sequence
      await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
    }

    console.log('✅ Catégories et produits insérés avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
  } finally {
    await pool.end();
  }
}

seed();
