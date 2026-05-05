const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function restructureMenu() {
  try {
    console.log('--- Restructuration du Menu ---');

    // 1. Renommer la catégorie Shawarmas en Sandwiches
    await pool.query("UPDATE categories SET name = 'Sandwiches' WHERE name = 'Shawarmas'");
    const catRes = await pool.query("SELECT id FROM categories WHERE name = 'Sandwiches'");
    const sandwichCatId = catRes.rows[0]?.id;

    // 2. Renommer Doritos Burger (au lieu de supprimer car référencé)
    await pool.query("UPDATE products SET name = 'Doritos Burger (OUT)', price = 0 WHERE name = 'Doritos Burger'");

    // 3. Mises à jour d'images spécifiques
    await pool.query("UPDATE products SET image_url = '/images/daddys.png' WHERE name = 'Homer Simpson'");
    
    const buffaloNames = ['BBQ Chicken', 'Lucifer (spicy)', 'Honey Dijon', 'Le Thai'];
    await pool.query("UPDATE products SET image_url = '/images/honey buffalo.png' WHERE name = ANY($1)", [buffaloNames]);

    const angryNames = ['Aioli', 'Crispy Jack'];
    await pool.query("UPDATE products SET image_url = '/images/angry-bird.png' WHERE name = ANY($1)", [angryNames]);

    await pool.query("UPDATE products SET image_url = '/images/tacos.png' WHERE name LIKE 'Tacos%' AND name NOT LIKE '%Doritos%'");

    // 4. Gérer les Boissons
    const drinkCatRes = await pool.query("SELECT id FROM categories WHERE name = 'Drinks' OR name = 'Boissons'");
    const drinkCatId = drinkCatRes.rows[0]?.id;
    
    if (drinkCatId) {
      // Transformer le "Soda" générique en Pepsi s'il existe, sinon ajouter
      const sodaCheck = await pool.query("SELECT id FROM products WHERE name = 'Soda' AND category_id = $1", [drinkCatId]);
      if (sodaCheck.rowCount > 0) {
        await pool.query("UPDATE products SET name = 'Pepsi', price = 8, image_url = '/images/pepsi.png' WHERE id = $1", [sodaCheck.rows[0].id]);
      } else {
        await pool.query("INSERT INTO products (name, price, category_id, image_url) VALUES ('Pepsi', 8, $1, '/images/pepsi.png')", [drinkCatId]);
      }
      
      const otherDrinks = [
        { name: 'Pepsi 1L', price: 15, image: '/images/pepsi-1L.png' },
        { name: 'Mirinda Pomme', price: 8, image: '/images/mirinda-pomme.png' },
        { name: 'Mirinda Citron', price: 8, image: '/images/mirinda-citron.png' },
        { name: 'Mirinda Orange', price: 8, image: '/images/mirinda-orange.png' }
      ];

      for (const d of otherDrinks) {
        const check = await pool.query("SELECT id FROM products WHERE name = $1", [d.name]);
        if (check.rowCount > 0) {
          await pool.query("UPDATE products SET price = $1, image_url = $2 WHERE id = $3", [d.price, d.image, check.rows[0].id]);
        } else {
          await pool.query("INSERT INTO products (name, price, category_id, image_url) VALUES ($1, $2, $3, $4)", [d.name, d.price, drinkCatId, d.image]);
        }
      }
    }

    // 5. Ajouter les nouveaux Sandwiches
    if (sandwichCatId) {
      const newSandwiches = [
        { name: 'Wrap Chicken', price: 35, image: '/images/wrap chicken.png' },
        { name: 'Shawarma Berliner', price: 38, image: '/images/shawarma-berlinier.png' },
        { name: 'Le Berliner Kebab', price: 40, image: '/images/shawarma-berlinier.png' },
        { name: 'Shawarma Wrap', price: 32, image: '/images/wrap shawarma.png' }
      ];

      for (const s of newSandwiches) {
        await pool.query("DELETE FROM products WHERE name = $1", [s.name]);
        await pool.query(
          "INSERT INTO products (name, price, category_id, image_url) VALUES ($1, $2, $3, $4)",
          [s.name, s.price, sandwichCatId, s.image]
        );
      }
    }

    // 6. Toppings images
    await pool.query("UPDATE products SET image_url = '/images/onion-rings.png' WHERE name = 'Crispy Onion'");
    await pool.query("UPDATE products SET image_url = '/images/mozza-sticks.png' WHERE name = 'Crispy Mozza'");

    console.log('✅ Menu restructuré avec succès !');

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

restructureMenu();
