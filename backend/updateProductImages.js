const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function updateImages() {
  const mapping = {
    "Angry Bird (Double)": "/images/angry-bird.png",
    "Honey Buffalo": "/images/honey buffalo.png",
    "Classic Smashed": "/images/smash-burger.png",
    "Daddy's": "/images/daddys.png",
    "Tripple Cheese": "/images/triple cheese.png",
    "Frites (M)": "/images/frites.jpg",
    "Frites (L)": "/images/frites.jpg",
    "Potatoes (M)": "/images/potatos.png",
    "Potatoes (L)": "/images/potatos.png",
    "Chicken Wings (Small)": "/images/wings.png",
    "Chicken Wings (Large)": "/images/wings.png",
    "Tenders (Small)": "/images/tenders.png",
    "Tenders (Large)": "/images/tenders.png",
    "Cheesy Sticks (Small)": "/images/mozza-sticks.png",
    "Cheesy Sticks (Large)": "/images/mozza-sticks.png",
    "Tacos Poulet (L)": "/images/tacos.png",
    "Tacos Poulet (XL)": "/images/tacos.png",
    "Tacos Doritos (L)": "/images/tacos-doritos.png",
    "Tacos Doritos (XL)": "/images/tacos-doritos.png",
    "Shawarma": "/images/shawarma.png",
    "Soda": "/images/pepsi.png",
    "Fresh Juice": "/images/lemonade.png"
  };

  try {
    console.log('--- Mise à jour des images produits ---');
    for (const [name, path] of Object.entries(mapping)) {
      const res = await pool.query(
        'UPDATE products SET image_url = $1 WHERE name = $2',
        [path, name]
      );
      if (res.rowCount > 0) {
        console.log(`✅ Image mise à jour pour : ${name}`);
      }
    }
    console.log('--- Terminé ---');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateImages();
