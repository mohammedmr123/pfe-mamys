import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../context/translations';
import './Kitchen.css';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useSettings();
  const t = translations[language];

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/pending`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeElapsed = (dateString) => {
    const start = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - start) / 60000);
    return `${diff} min`;
  };

  const markAsReady = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/kitchen`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchen_status: 'READY' })
      });
      if (res.ok) {
        fetchPendingOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="pos-loading">Chargement de la cuisine...</div>;

  return (
    <div className="kitchen-container">
      <div className="tables-header">
        <h1>{t.kitchen}</h1>
        <div className="k-stats glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          {orders.length} {t.pending_orders}
        </div>
      </div>

      <div className="kitchen-grid">
        {orders.map(order => (
          <div key={order.id} className="kitchen-order-card glass-panel">
            <div className="k-order-header">
              <span className="k-table-num">
                {order.table_number ? `${t.table} ${order.table_number}` : 'Vente Directe'}
              </span>
              <span className="k-time">{getTimeElapsed(order.created_at)}</span>
            </div>
            
            <div className="k-items-list">
              {order.items.map(item => (
                <div key={item.id} className="k-item">
                  <span className="k-item-qty">x{item.quantity}</span>
                  <span className="k-item-name">{item.product_name}</span>
                </div>
              ))}
            </div>

            {order.comment && (
              <div className="k-comment">
                <strong>📝 {t.note} :</strong> {order.comment}
              </div>
            )}

            <button className="k-btn-ready" onClick={() => markAsReady(order.id)}>
              {t.ready} ✅
            </button>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="no-orders glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            Aucune commande en attente. Tout est calme ! 👨‍🍳
          </div>
        )}
      </div>
    </div>
  );
};

export default Kitchen;
