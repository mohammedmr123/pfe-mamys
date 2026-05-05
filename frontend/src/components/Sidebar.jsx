import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../context/translations';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const { language } = useSettings();
  const t = translations[language];
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <div className="logo-icon">POS</div>
        <h2>RestoSync</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          📋 {t.dashboard}
        </NavLink>
        <NavLink to="/pos" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          🛒 {t.pos}
        </NavLink>
        <NavLink to="/menu" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          🍔 {t.menu}
        </NavLink>
        <NavLink to="/tables" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          🍽️ {t.tables}
        </NavLink>
        <NavLink to="/kitchen" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          👨‍🍳 {t.kitchen}
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>{t.logout}</button>
      </div>
    </aside>
  );
};
export default Sidebar;
