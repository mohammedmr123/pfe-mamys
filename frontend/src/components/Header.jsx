import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const { language, setLanguage, currency, setCurrency } = useSettings();
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-settings">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="settings-select glass-panel">
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇺🇸 EN</option>
            <option value="ar">🇲🇦 AR</option>
          </select>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="settings-select glass-panel">
            <option value="MAD">MAD</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>
      <div className="header-user">
        <div className="user-info">
          <span className="user-name">{user?.username || 'Utilisateur'}</span>
          <span className="user-role">{user?.role === 'ADMIN' ? 'Administrateur' : 'Serveur'}</span>
        </div>
        <div className="user-avatar">
          {(user?.username || 'U').substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
export default Header;
