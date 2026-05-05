const db = require('../config/db');

// Récupérer toutes les tables
exports.getAllTables = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, u.username as waiter_name 
      FROM restaurant_tables t 
      LEFT JOIN users u ON t.waiter_id = u.id 
      ORDER BY t.table_number ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des tables :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour le statut et le nombre de personnes d'une table
exports.updateTable = async (req, res) => {
  const { id } = req.params;
  const { status, guests_count, waiter_id, reservation_time } = req.body;

  try {
    const result = await db.query(
      'UPDATE restaurant_tables SET status = COALESCE($1, status), guests_count = COALESCE($2, guests_count), waiter_id = COALESCE($3, waiter_id), reservation_time = $4 WHERE id = $5 RETURNING *',
      [status, guests_count, waiter_id || null, reservation_time || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la table :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer les commandes en cours d'une table
exports.getTableOrders = async (req, res) => {
  const { id } = req.params;

  try {
    // On cherche les commandes "PENDING"
    const ordersResult = await db.query(
      "SELECT * FROM orders WHERE table_id = $1 AND status = 'PENDING' ORDER BY created_at ASC",
      [id]
    );

    if (ordersResult.rowCount === 0) {
      return res.json([]);
    }

    // On va récupérer les items pour ces commandes
    const orders = ordersResult.rows;
    const orderIds = orders.map(o => o.id);
    
    // Fallback if no order ids (handled by rowCount === 0 above)
    const itemsResult = await db.query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ANY($1::int[])`,
      [orderIds]
    );

    const items = itemsResult.rows;

    // Grouper les items par commande
    const ordersWithItems = orders.map(order => {
      return {
        ...order,
        items: items.filter(item => item.order_id === order.id)
      };
    });

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes de la table :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
