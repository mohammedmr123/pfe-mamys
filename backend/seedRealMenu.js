const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function seed() {
  try {
    console.log('--- Nettoyage du menu actuel ---');
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');

    const categories = [
      { name: 'Chicken Burgers', icon: '🍗' },
      { name: 'Beef Burgers (Smashed)', icon: '🍔' },
      { name: 'Sides', icon: '🍟' },
      { name: 'Toppings', icon: '🧀' },
      { name: 'Tacos', icon: '🌮' },
      { name: 'Shawarmas', icon: '🌯' },
      { name: 'Drinks', icon: '🥤' }
    ];

    const catIds = {};

    for (const cat of categories) {
      const res = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [cat.name]);
      catIds[cat.name] = res.rows[0].id;
    }

    const products = [
      // Chicken Burgers
      { name: 'BBQ Chicken', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Honey Buffalo', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Aioli', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Lucifer (spicy)', price: 35, cat: 'Chicken Burgers', icon: '🌶️' },
      { name: 'Le Thai', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Crispy Jack', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Honey Dijon', price: 35, cat: 'Chicken Burgers', icon: '🍗' },
      { name: 'Angry Bird (Double)', price: 49, cat: 'Chicken Burgers', icon: '🦅' },

      // Beef Burgers
      { name: 'Classic Smashed', price: 35, cat: 'Beef Burgers (Smashed)', icon: '🍔' },
      { name: "Daddy's", price: 49, cat: 'Beef Burgers (Smashed)', icon: '👨' },
      { name: 'Homer Simpson', price: 49, cat: 'Beef Burgers (Smashed)', icon: '🍩' },
      { name: 'Doritos Burger', price: 49, cat: 'Beef Burgers (Smashed)', icon: '📐' },
      { name: 'Tripple Cheese', price: 59, cat: 'Beef Burgers (Smashed)', icon: '🧀' },

      // Sides
      { name: 'Frites (M)', price: 7, cat: 'Sides', icon: '🍟' },
      { name: 'Frites (L)', price: 12, cat: 'Sides', icon: '🍟' },
      { name: 'Potatoes (M)', price: 8, cat: 'Sides', icon: '🥔' },
      { name: 'Potatoes (L)', price: 15, cat: 'Sides', icon: '🥔' },
      { name: 'Chicken Wings (Small)', price: 25, cat: 'Sides', icon: '🍗' },
      { name: 'Chicken Wings (Large)', price: 39, cat: 'Sides', icon: '🍗' },
      { name: 'Tenders (Small)', price: 30, cat: 'Sides', icon: '🍗' },
      { name: 'Tenders (Large)', price: 49, cat: 'Sides', icon: '🍗' },
      { name: 'Cheesy Sticks (Small)', price: 25, cat: 'Sides', icon: '🧀' },
      { name: 'Cheesy Sticks (Large)', price: 45, cat: 'Sides', icon: '🧀' },

      // Toppings
      { name: 'Cheese', price: 3, cat: 'Toppings', icon: '🧀' },
      { name: 'Jalapeno', price: 3, cat: 'Toppings', icon: '🌶️' },
      { name: 'Egg', price: 5, cat: 'Toppings', icon: '🍳' },
      { name: 'Crispy Onion', price: 5, cat: 'Toppings', icon: '🧅' },
      { name: 'Caramelised Onion', price: 5, cat: 'Toppings', icon: '🧅' },
      { name: 'Crispy Mozza', price: 8, cat: 'Toppings', icon: '🧀' },

      // Tacos
      { name: 'Tacos Poulet (L)', price: 35, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Poulet (XL)', price: 45, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Poulet Frit (L)', price: 36, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Poulet Frit (XL)', price: 46, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Viande Hachée (L)', price: 36, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Viande Hachée (XL)', price: 46, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Cordon Bleu (L)', price: 39, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Cordon Bleu (XL)', price: 49, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Mixte (L)', price: 42, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Mixte (XL)', price: 55, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Doritos (L)', price: 45, cat: 'Tacos', icon: '🌮' },
      { name: 'Tacos Doritos (XL)', price: 65, cat: 'Tacos', icon: '🌮' },

      // Shawarmas
      { name: 'Shawarma', price: 28, cat: 'Shawarmas', icon: '🌯' },
      { name: 'Shawarma Arabi', price: 30, cat: 'Shawarmas', icon: '🌯' },

      // Drinks
      { name: 'Soda', price: 8, cat: 'Drinks', icon: '🥤' },
      { name: 'Fresh Juice', price: 16, cat: 'Drinks', icon: '🍹' }
    ];

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (name, price, category_id, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5)',
        [p.name, p.price, catIds[p.cat], p.icon, 100]
      );
    }

    console.log('✅ Menu réel inséré avec succès !');

  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await pool.end();
  }
}

seed();
