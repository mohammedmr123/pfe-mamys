require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Autoriser toutes les sources pour le moment (plus simple pour le PFE)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

// Import DB (Ceci sert juste à déclencher la vérification de connexion)
require('./config/db');

// Import des routes
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const statsRoutes = require('./routes/statsRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const userController = require('./controllers/userController');

// Définition des routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/website', websiteRoutes);
app.get('/api/users', userController.getAllUsers);
app.post('/api/login', userController.login);

// Route de bienvenue (Test)
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API POS (Point de Vente) !' });
});

// Port d'écoute
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
