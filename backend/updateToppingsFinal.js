require('dotenv').config();
const pool = require('./src/config/db');

const updateToppings = async () => {
  try {
    console.log('Suppression des toppings non désirés...');
    await pool.query(
      "DELETE FROM products WHERE name IN ('Cheese', 'Caramelised Onion', 'Egg', 'Crispy Onion', 'Jalapeno', 'Crispy Mozza', 'Fromage (Cheddar)', 'Oignons Caramélisés', 'Sauce Signature', 'Œuf')"
    );

    console.log('Mise à jour de l\'image du Bacon de Bœuf...');
    await pool.query(
      "UPDATE products SET image_url = '/images/bacon_boeuf.png' WHERE name = 'Bacon de Bœuf'"
    );

    console.log('✅ Mise à jour terminée !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err);
    process.exit(1);
  }
};

updateToppings();
