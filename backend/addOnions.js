require('dotenv').config();
const pool = require('./src/config/db');

const addOnions = async () => {
  try {
    const res = await pool.query("SELECT id FROM categories WHERE name = 'Toppings'");
    const catId = res.rows[0].id;
    
    await pool.query(
      "INSERT INTO products (name, price, category_id, image_url) VALUES ($1, $2, $3, $4)",
      ['Oignons Caramélisés', 5, catId, '/images/caramalized onions.png']
    );
    
    console.log('✅ Oignons Caramélisés ajoutés !');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

addOnions();
