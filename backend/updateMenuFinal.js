const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function updateMenuFinal() {
  try {
    console.log('--- Mise à jour finale du Menu ---');

    // 1. Désactiver les produits demandés
    await pool.query("UPDATE products SET is_active = FALSE WHERE name = 'Doritos Burger (OUT)' OR name = 'Shawarma Arabi'");
    console.log('✅ Doritos Burger et Shawarma Arabi désactivés.');

    // 2. Mettre à jour les images des Toppings
    const toppingUpdates = [
      { name: 'Egg', img: '/images/egg.png' },
      { name: 'Caramelised Onion', img: '/images/caramalized onions.png' },
      { name: 'Jalapeno', img: '/images/jalapeno.png' },
      { name: 'Cheese', img: '/images/cheese.png' },
      { name: 'Crispy Onion', img: '/images/crispy onions.png' }
    ];

    for (const t of toppingUpdates) {
      await pool.query("UPDATE products SET image_url = $1 WHERE name = $2", [t.img, t.name]);
      console.log(`✅ Image mise à jour pour le topping : ${t.name}`);
    }

    console.log('--- Terminé ---');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateMenuFinal();
