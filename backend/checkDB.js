require('dotenv').config();
const pool = require('./src/config/db');

const checkDB = async () => {
  try {
    const cats = await pool.query("SELECT * FROM categories WHERE name = 'Toppings'");
    console.log('Categories:', cats.rows);
    
    if (cats.rows.length > 0) {
      const prods = await pool.query("SELECT * FROM products WHERE category_id = $1", [cats.rows[0].id]);
      console.log('Products for Toppings:', prods.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
