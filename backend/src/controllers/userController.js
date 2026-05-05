const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, username, role FROM users WHERE role IN ('ADMIN', 'CASHIER') ORDER BY username ASC");
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur users :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    
    const user = result.rows[0];
    // In a real app, use bcrypt to compare passwords
    if (password === '1234' || user.password_hash === 'hashed_pass') {
      res.json({ id: user.id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: 'Mot de passe incorrect' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
