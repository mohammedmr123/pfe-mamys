const db = require('../config/db');

exports.createOrder = async (req, res) => {
  const { table_id, user_id, items, payment_method, status, comment } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La commande ne contient aucun article.' });
  }

  try {
    // 1. Calculer le total
    let total_amount = 0;
    for (let item of items) {
      total_amount += (item.price * item.quantity);
    }

    const finalStatus = status || 'PAID';
    const finalPayment = payment_method || (finalStatus === 'PAID' ? 'CASH' : null);

    // 2. Insérer la commande
    const orderResult = await db.query(
      'INSERT INTO orders (table_id, user_id, total_amount, status, payment_method, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [table_id || null, user_id || null, total_amount, finalStatus, finalPayment, comment || null]
    );
    const orderId = orderResult.rows[0].id;

    // 3. Insérer les articles (order_items) et décrémenter le stock des INGRÉDIENTS
    for (let item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
      
      // Récupérer la recette du produit
      const recipeRes = await db.query('SELECT * FROM product_ingredients WHERE product_id = $1', [item.id]);
      
      // Décrémenter chaque ingrédient
      for (let recipeItem of recipeRes.rows) {
        await db.query(
          'UPDATE ingredients SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [recipeItem.quantity_needed * item.quantity, recipeItem.ingredient_id]
        );
      }
    }

    // 4. Mettre à jour la table si table_id est fourni
    if (table_id) {
       const tableStatus = finalStatus === 'PENDING' ? 'OCCUPIED' : 'AVAILABLE';
       // On assigne le serveur à la table s'il est fourni
       await db.query(
         'UPDATE restaurant_tables SET status = $1, waiter_id = COALESCE($2, waiter_id) WHERE id = $3', 
         [tableStatus, user_id || null, table_id]
       );
    }

    res.status(201).json({ message: 'Commande enregistrée avec succès !', orderId: orderId });
  } catch (err) {
    console.error('Erreur lors de la création de la commande :', err);
    res.status(500).json({ error: 'Erreur lors de la validation de la commande' });
  }
};

// Finaliser le paiement de toutes les commandes d'une table
exports.payTableOrders = async (req, res) => {
  const { table_id } = req.params;
  const { payment_method } = req.body;

  try {
    // 1. Mettre à jour toutes les commandes PENDING de cette table en PAID
    await db.query(
      "UPDATE orders SET status = 'PAID', payment_method = $1 WHERE table_id = $2 AND status = 'PENDING'",
      [payment_method || 'CASH', table_id]
    );

    // 2. Libérer la table
    await db.query(
      "UPDATE restaurant_tables SET status = 'AVAILABLE', guests_count = 0, waiter_id = NULL WHERE id = $1",
      [table_id]
    );

    res.json({ message: 'Addition finalisée avec succès !' });
  } catch (err) {
    console.error('Erreur lors de la finalisation de l\'addition :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const ordersResult = await db.query(`
      SELECT o.*, t.table_number 
      FROM orders o 
      LEFT JOIN restaurant_tables t ON o.table_id = t.id 
      WHERE o.kitchen_status = 'PENDING' 
      ORDER BY o.created_at ASC
    `);
    const orders = ordersResult.rows;
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ANY($1::int[])
    `, [orderIds]);

    const items = itemsResult.rows;
    const result = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateKitchenStatus = async (req, res) => {
  const { id } = req.params;
  const { kitchen_status } = req.body;
  try {
    await db.query('UPDATE orders SET kitchen_status = $1 WHERE id = $2', [kitchen_status, id]);
    res.json({ message: 'Statut cuisine mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
