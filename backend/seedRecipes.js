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
    console.log('--- Seeding Ingrédients et Recettes ---');

    // 1. Créer les ingrédients de base
    const ingredients = [
      { name: 'Bun Burger', unit: 'unité', stock: 50 },
      { name: 'Steak Haché', unit: 'unité', stock: 40 },
      { name: 'Filet de Poulet', unit: 'unité', stock: 30 },
      { name: 'Tranche de Fromage', unit: 'unité', stock: 100 },
      { name: 'Galette Tacos', unit: 'unité', stock: 60 },
      { name: 'Frites', unit: 'kg', stock: 10 },
      { name: 'Sauce BBQ', unit: 'l', stock: 2 },
      { name: 'Doritos', unit: 'paquet', stock: 5 }
    ];

    const ingIds = {};
    for (const ing of ingredients) {
      const res = await pool.query(
        'INSERT INTO ingredients (name, unit, stock_quantity) VALUES ($1, $2, $3) RETURNING id',
        [ing.name, ing.unit, ing.stock]
      );
      ingIds[ing.name] = res.rows[0].id;
    }

    // 2. Récupérer les produits existants
    const productsRes = await pool.query('SELECT id, name FROM products');
    const products = productsRes.rows;

    const findId = (name) => products.find(p => p.name === name)?.id;

    // 3. Créer des recettes
    const recipes = [
      // Burgers Poulet
      { prod: 'BBQ Chicken', items: [ { name: 'Bun Burger', qty: 1 }, { name: 'Filet de Poulet', qty: 1 }, { name: 'Sauce BBQ', qty: 0.05 } ] },
      { prod: 'Angry Bird (Double)', items: [ { name: 'Bun Burger', qty: 1 }, { name: 'Filet de Poulet', qty: 2 } ] },
      
      // Burgers Boeuf
      { prod: 'Classic Smashed', items: [ { name: 'Bun Burger', qty: 1 }, { name: 'Steak Haché', qty: 1 } ] },
      { prod: 'Tripple Cheese', items: [ { name: 'Bun Burger', qty: 1 }, { name: 'Steak Haché', qty: 1 }, { name: 'Tranche de Fromage', qty: 3 } ] },
      { prod: 'Doritos Burger', items: [ { name: 'Bun Burger', qty: 1 }, { name: 'Steak Haché', qty: 1 }, { name: 'Doritos', qty: 0.1 } ] },

      // Tacos
      { prod: 'Tacos Poulet (L)', items: [ { name: 'Galette Tacos', qty: 1 }, { name: 'Filet de Poulet', qty: 1 }, { name: 'Frites', qty: 0.1 } ] },
      { prod: 'Tacos Doritos (XL)', items: [ { name: 'Galette Tacos', qty: 2 }, { name: 'Filet de Poulet', qty: 2 }, { name: 'Doritos', qty: 0.2 } ] }
    ];

    for (const r of recipes) {
      const pid = findId(r.prod);
      if (pid) {
        for (const item of r.items) {
          await pool.query(
            'INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES ($1, $2, $3)',
            [pid, ingIds[item.name], item.qty]
          );
        }
      }
    }

    console.log('✅ Recettes et ingrédients insérés !');

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seed();
