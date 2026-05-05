const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function migrate() {
  try {
    console.log('Début de la migration...');
    // Vérifier si la colonne existe déjà
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='restaurant_tables' and column_name='guests_count';
    `;
    const res = await pool.query(checkQuery);
    
    if (res.rowCount === 0) {
      console.log('Ajout de la colonne guests_count...');
      await pool.query('ALTER TABLE restaurant_tables ADD COLUMN guests_count INT DEFAULT 0;');
      console.log('✅ Colonne guests_count ajoutée avec succès.');
    }

    // Vérifier waiter_id
    const waiterCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='restaurant_tables' AND column_name='waiter_id';
    `);
    if (waiterCheck.rowCount === 0) {
      console.log('Ajout de la colonne waiter_id...');
      await pool.query('ALTER TABLE restaurant_tables ADD COLUMN waiter_id INT REFERENCES users(id);');
    }

    // Vérifier stock_quantity dans products
    const stockCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='products' AND column_name='stock_quantity';
    `);
    if (stockCheck.rowCount === 0) {
      console.log('Ajout de la colonne stock_quantity...');
      await pool.query('ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 100;');
    }

    // Vérifier comment dans orders
    const commentCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='comment';
    `);
    if (commentCheck.rowCount === 0) {
      console.log('Ajout de la colonne comment...');
      await pool.query('ALTER TABLE orders ADD COLUMN comment TEXT;');
    }

    // Vérifier kitchen_status dans orders
    const kitchenStatusCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='kitchen_status';
    `);
    if (kitchenStatusCheck.rowCount === 0) {
      console.log('Ajout de la colonne kitchen_status...');
      await pool.query("ALTER TABLE orders ADD COLUMN kitchen_status VARCHAR(20) DEFAULT 'PENDING';");
    }

    // Vérifier reservation_time dans restaurant_tables
    const reservationTimeCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='restaurant_tables' AND column_name='reservation_time';
    `);
    if (reservationTimeCheck.rowCount === 0) {
      console.log('Ajout de la colonne reservation_time...');
      await pool.query('ALTER TABLE restaurant_tables ADD COLUMN reservation_time TIMESTAMP;');
    }

    // Vérifier is_active dans products
    const isActiveCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='products' AND column_name='is_active';
    `);
    if (isActiveCheck.rowCount === 0) {
      console.log('Ajout de la colonne is_active...');
      await pool.query('ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;');
    }

    // Créer la table ingredients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) DEFAULT 'unité',
        stock_quantity DECIMAL(10,2) DEFAULT 0,
        min_stock DECIMAL(10,2) DEFAULT 10
      );
    `);

    // Créer la table product_ingredients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_ingredients (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity_needed DECIMAL(10,2) DEFAULT 1
      );
    `);

    // Créer la table reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_approved BOOLEAN DEFAULT TRUE
      );
    `);

    // Créer la table reservations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        guests INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migration terminée avec succès.');
  } catch (err) {
    console.error('❌ Erreur lors de la migration :', err);
  } finally {
    await pool.end();
  }
}

migrate();
