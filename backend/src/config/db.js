const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // On s'assure de trouver le .env à la racine

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté avec succès.'))
  .catch((err) => console.error('❌ Erreur de connexion à PostgreSQL :', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
