require('dotenv').config();
const pool = require('./src/config/db');

const seedToppings = async () => {
  try {
    // 1. Get or Create Toppings category
    let catId;
    const existingCat = await pool.query("SELECT id FROM categories WHERE name = 'Toppings'");
    
    if (existingCat.rows.length > 0) {
      catId = existingCat.rows[0].id;
      console.log('Catégorie Toppings déjà existante ID:', catId);
    } else {
      const catRes = await pool.query(
        "INSERT INTO categories (name) VALUES ('Toppings') RETURNING id"
      );
      catId = catRes.rows[0].id;
      console.log('Nouvelle catégorie Toppings créée ID:', catId);
    }

    // 2. Add Toppings (Check if they exist first to avoid duplicates)
    const toppings = [
      { name: "Fromage (Cheddar)", price: 5, image_url: "/images/cheddar.png" },
      { name: "Œuf", price: 5, image_url: "/images/egg.png" },
      { name: "Bacon de Bœuf", price: 10, image_url: "/images/bacon.png" },
      { name: "Oignons Caramélisés", price: 3, image_url: "/images/onions.png" },
      { name: "Sauce Signature", price: 2, image_url: "/images/sauce.png" }
    ];

    for (const topping of toppings) {
      const existingProd = await pool.query("SELECT id FROM products WHERE name = $1", [topping.name]);
      if (existingProd.rows.length === 0) {
        await pool.query(
          "INSERT INTO products (name, price, category_id, image_url) VALUES ($1, $2, $3, $4)",
          [topping.name, topping.price, catId, topping.image_url]
        );
        console.log(`Produit ajouté : ${topping.name}`);
      }
    }

    console.log('✅ Synchronisation Toppings terminée !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err);
    process.exit(1);
  }
};

seedToppings();
