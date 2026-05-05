const db = require('../config/db');

// Récupérer tous les produits (avec option de filtre par catégorie)
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'name', i.name,
            'stock', i.stock_quantity,
            'needed', pi.quantity_needed
          )
        ) FILTER (WHERE i.id IS NOT NULL) as ingredients
      FROM products p
      LEFT JOIN product_ingredients pi ON p.id = pi.product_id
      LEFT JOIN ingredients i ON pi.ingredient_id = i.id
      WHERE p.is_active = TRUE
    `;
    let params = [];

    if (category) {
      query = query.replace('WHERE p.is_active = TRUE', 'WHERE p.is_active = TRUE AND p.category_id = $1');
      params.push(category);
    }
    
    query += ' GROUP BY p.id ORDER BY p.name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des produits :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer un produit
exports.createProduct = async (req, res) => {
  const { name, description, price, category_id, image_url, stock_quantity } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category_id, image_url, stock_quantity || 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Modifier un produit
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url, is_available, stock_quantity } = req.body;
  try {
    const result = await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, is_available = $6, stock_quantity = $7 WHERE id = $8 RETURNING *',
      [name, description, price, category_id, image_url, is_available, stock_quantity, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
