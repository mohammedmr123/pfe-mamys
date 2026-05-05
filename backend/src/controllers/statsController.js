const db = require('../config/db');

// Ventes par période (Jour, Mois, An)
exports.getSalesTrend = async (req, res) => {
  const { period } = req.query; // 'day', 'month', 'year'
  
  let groupBy;
  let dateFormat;

  switch (period) {
    case 'month':
      groupBy = "DATE_TRUNC('month', created_at)";
      dateFormat = 'YYYY-MM';
      break;
    case 'year':
      groupBy = "DATE_TRUNC('year', created_at)";
      dateFormat = 'YYYY';
      break;
    default: // day
      groupBy = "DATE_TRUNC('day', created_at)";
      dateFormat = 'YYYY-MM-DD';
  }

  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(${groupBy}, '${dateFormat}') as date,
        SUM(total_amount) as total
      FROM orders
      WHERE status = 'PAID'
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} ASC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur stats ventes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Performance des serveurs
exports.getServerPerformance = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.username,
        SUM(o.total_amount) as total_sales,
        COUNT(o.id) as order_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status = 'PAID'
      GROUP BY u.username
      ORDER BY total_sales DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur stats serveurs :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Top Produits
exports.getTopProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_qty
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'PAID'
      GROUP BY p.name
      ORDER BY total_qty DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur stats produits :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Répartition par mode de paiement
exports.getPaymentStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM orders
      WHERE status = 'PAID' AND payment_method IS NOT NULL
      GROUP BY payment_method
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur stats paiement :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Résumé global (aujourd'hui)
exports.getGlobalSummary = async (req, res) => {
  try {
    const summary = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as avg_basket
      FROM orders
      WHERE status = 'PAID' AND created_at >= CURRENT_DATE
    `);
    res.json(summary.rows[0]);
  } catch (err) {
    console.error('Erreur stats résumé :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
