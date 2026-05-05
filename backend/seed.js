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
    console.log('Vérification des tables du restaurant...');
    const res = await pool.query('SELECT COUNT(*) FROM restaurant_tables');
    const count = parseInt(res.rows[0].count, 10);
    
    if (count === 0) {
      console.log('La table est vide. Insertion de tables de test...');
      const insertQuery = `
        INSERT INTO restaurant_tables (table_number, status, guests_count) VALUES 
        (1, 'AVAILABLE', 0),
        (2, 'OCCUPIED', 2),
        (3, 'AVAILABLE', 0),
        (4, 'RESERVED', 4),
        (5, 'AVAILABLE', 0),
        (6, 'OCCUPIED', 3),
        (7, 'AVAILABLE', 0),
        (8, 'AVAILABLE', 0)
      `;
      await pool.query(insertQuery);
      console.log('✅ Tables insérées avec succès !');
    } else {
      console.log(`✅ Il y a déjà ${count} tables dans la base de données.`);
    }
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
  } finally {
    await pool.end();
  }
}

seed();
