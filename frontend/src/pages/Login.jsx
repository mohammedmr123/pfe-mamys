import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Identifiants invalides. Essayez "Amine" et "1234"');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-logo">🍔</div>
        <h1>RestoSync</h1>
        <h2>Connexion au système POS</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Nom d'utilisateur" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
