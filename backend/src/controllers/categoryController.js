const db = require('../config/db');

// Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des catégories :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une catégorie
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Modifier une catégorie
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await db.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
