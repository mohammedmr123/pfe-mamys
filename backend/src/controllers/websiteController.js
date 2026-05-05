const pool = require('../config/db');

// --- REVIEWS ---

exports.getAllReviews = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE is_approved = TRUE ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  const { name, rating, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (name, rating, comment) VALUES ($1, $2, $3) RETURNING *',
      [name, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- RESERVATIONS ---

exports.createReservation = async (req, res) => {
  const { name, email, phone, date, time, guests } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO website_reservations (name, email, phone, date, time, guests) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, date, time, guests]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
