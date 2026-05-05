require('dotenv').config();
const pool = require('./src/config/db');

const restoreToppings = async () => {
  try {
    const catRes = await pool.query("SELECT id FROM categories WHERE name = 'Toppings'");
    const catId = catRes.rows[0].id;

    const toppingsToRestore = [
      { name: "Œuf", price: 5, image_url: "/images/egg.png" },
      { name: "Jalapenos", price: 3, image_url: "/images/jalapeno.png" },
      { name: "Oignons Croustillants", price: 5, image_url: "/images/crispy onions.png" },
      { name: "Crispy Mozza", price: 8, image_url: "/images/mozza-sticks.png" }
    ];

    for (const topping of toppingsToRestore) {
      const existing = await pool.query("SELECT id FROM products WHERE name = $1", [topping.name]);
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO products (name, price, category_id, image_url) VALUES ($1, $2, $3, $4)",
          [topping.name, topping.price, catId, topping.image_url]
        );
        console.log(`Restauré : ${topping.name}`);
      }
    }

    console.log('✅ Toppings restaurés !');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

restoreToppings();
