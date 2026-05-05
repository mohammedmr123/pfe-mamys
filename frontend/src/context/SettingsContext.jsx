import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'fr');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'MAD');

  useEffect(() => {
    localStorage.setItem('lang', language);
    // RTL Support for Arabic
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatPrice = (price) => {
    const p = Number(price);
    switch (currency) {
      case 'USD': return `$${p.toFixed(2)}`;
      case 'EUR': return `${p.toFixed(2)} €`;
      case 'MAD': return `${p.toFixed(2)} DH`;
      default: return `${p.toFixed(2)} DH`;
    }
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, currency, setCurrency, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
