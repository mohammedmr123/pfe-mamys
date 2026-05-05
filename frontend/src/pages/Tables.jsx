import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../context/translations';
import Receipt from '../components/Receipt';
import './Tables.css';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalGuests, setModalGuests] = useState(0);
  const [tableOrders, setTableOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalWaiter, setModalWaiter] = useState('');
  const [modalReservationTime, setModalReservationTime] = useState('');
  const [printedOrder, setPrintedOrder] = useState(null);
  const { language, formatPrice } = useSettings();
  const t = translations[language];

  useEffect(() => {
    fetchTables();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tables`);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }

      // Fallback si vide
      if (data.length === 0) {
        data = [
          { id: 1, table_number: 1, status: 'AVAILABLE', guests_count: 0 },
          { id: 2, table_number: 2, status: 'OCCUPIED', guests_count: 2 },
          { id: 3, table_number: 3, status: 'AVAILABLE', guests_count: 0 },
          { id: 4, table_number: 4, status: 'RESERVED', guests_count: 4 },
        ];
      }
      
      setTables(data);
    } catch (error) {
      console.error("Erreur de chargement des tables", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return 'status-available';
      case 'OCCUPIED': return 'status-occupied';
      case 'RESERVED': return 'status-reserved';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'AVAILABLE': return t.available;
      case 'OCCUPIED': return t.occupied;
      case 'RESERVED': return t.reserved;
      default: return 'Inconnu';
    }
  };

  // --- Modal Logic ---
  const openModal = async (table) => {
    setSelectedTable(table);
    setModalStatus(table.status);
    setModalGuests(table.guests_count || 0);
    setModalWaiter(table.waiter_id || '');
    
    // Format date for datetime-local input
    if (table.reservation_time) {
      const date = new Date(table.reservation_time);
      const formatted = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString().slice(0, 16);
      setModalReservationTime(formatted);
    } else {
      setModalReservationTime('');
    }
    
    setIsModalOpen(true);
    
    // Fetch orders for this table
    try {
      setOrdersLoading(true);
      const res = await fetch(`http://localhost:5000/api/tables/${table.id}/orders`);
      if (res.ok) {
        const data = await res.json();
        setTableOrders(data);
      } else {
        setTableOrders([]);
      }
    } catch (error) {
      console.error("Erreur fetch orders", error);
      setTableOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  const finalizeTablePayment = async (method) => {
    if (!selectedTable) return;

    if (!window.confirm(`Confirmer l'encaissement (${method}) pour la Table ${selectedTable.table_number} ?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/pay-table/${selectedTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: method })
      });

      if (res.ok) {
        alert("Addition réglée avec succès !");
        
        // Préparer le ticket
        const mergedItems = Object.values(tableOrders.reduce((acc, order) => {
          order.items.forEach(item => {
            const key = item.product_id;
            if (acc[key]) {
              acc[key].quantity += item.quantity;
            } else {
              acc[key] = { 
                product_name: item.product_name, 
                quantity: item.quantity, 
                unit_price: item.unit_price 
              };
            }
          });
          return acc;
        }, {}));

        setPrintedOrder({
          items: mergedItems,
          table_number: selectedTable.table_number,
          waiter_name: selectedTable.waiter_name
        });

        // Impression
        setTimeout(() => {
          window.print();
        }, 500);

        fetchTables();
        closeModal();
      } else {
        alert("Erreur lors de l'encaissement.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  const saveTableChanges = async () => {
    if (!selectedTable) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tables/${selectedTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          guests_count: parseInt(modalGuests, 10),
          waiter_id: modalWaiter ? parseInt(modalWaiter, 10) : null,
          reservation_time: modalStatus === 'RESERVED' ? modalReservationTime : null
        })
      });

      if (res.ok) {
        // Rafraichir les tables localement ou refetch
        fetchTables();
        closeModal();
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  if (loading) return <div className="tables-loading">Chargement du plan de salle...</div>;

  return (
    <div className="tables-container">
      <div className="tables-header">
        <h1>Plan de Salle</h1>
        <div className="status-legend glass-panel">
          <div className="legend-item"><span className="dot status-available"></span> {t.available}</div>
          <div className="legend-item"><span className="dot status-occupied"></span> {t.occupied}</div>
          <div className="legend-item"><span className="dot status-reserved"></span> {t.reserved}</div>
        </div>
      </div>

      <div className="tables-grid">
        {tables.map(table => (
          <div key={table.id} className={`table-card glass-panel ${getStatusColor(table.status)}`}>
            <div className="table-number">Table {table.table_number}</div>
            <div className="table-status">{getStatusLabel(table.status)}</div>
            {table.waiter_name && (
              <div className="table-waiter">🤵 {table.waiter_name}</div>
            )}
            {table.guests_count > 0 && (
              <div className="table-guests">👥 {table.guests_count} {t.guests}</div>
            )}
            {table.status === 'RESERVED' && table.reservation_time && (
              <div className="table-time">⏰ {new Date(table.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            )}
            <div className="table-actions">
               <button className="action-btn" onClick={() => openModal(table)}>Voir</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && selectedTable && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>Table {selectedTable.table_number}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Statut :</label>
                <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                  <option value="AVAILABLE">Libre</option>
                  <option value="OCCUPIED">Occupée</option>
                  <option value="RESERVED">Réservée</option>
                </select>
              </div>

              {modalStatus === 'RESERVED' && (
                <div className="form-group">
                  <label>Heure de Réservation :</label>
                  <input 
                    type="datetime-local" 
                    value={modalReservationTime} 
                    onChange={(e) => setModalReservationTime(e.target.value)} 
                  />
                </div>
              )}

              <div className="form-group">
                <label>Nombre de personnes :</label>
                <input 
                  type="number" 
                  min="0" 
                  value={modalGuests} 
                  onChange={(e) => setModalGuests(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Serveur assigné :</label>
                <select value={modalWaiter} onChange={(e) => setModalWaiter(e.target.value)}>
                  <option value="">Aucun serveur</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div className="orders-section">
                <h3>Addition de la table</h3>
                {ordersLoading ? (
                  <p>Chargement de l'addition...</p>
                ) : tableOrders.length === 0 ? (
                  <p className="no-orders">Aucune commande pour cette table.</p>
                ) : (
                  <div className="bill-summary">
                    <table className="bill-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Qté</th>
                          <th>Prix</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(tableOrders.reduce((acc, order) => {
                          order.items.forEach(item => {
                            if (acc[item.product_id]) {
                              acc[item.product_id].quantity += item.quantity;
                            } else {
                              acc[item.product_id] = { ...item };
                            }
                          });
                          return acc;
                        }, {})).map(item => (
                          <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.unit_price)}</td>
                            <td>{formatPrice(item.quantity * item.unit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="bill-total-row">
                      <span>{t.total} :</span>
                      <span className="total-amount">
                        {formatPrice(tableOrders.reduce((sum, order) => sum + Number(order.total_amount), 0))}
                      </span>
                    </div>

                    <div className="bill-actions">
                      <button 
                        className="btn-pay-cash" 
                        onClick={() => finalizeTablePayment('CASH')}
                        disabled={ordersLoading}
                      >
                        💵 {t.pay} ({t.cash})
                      </button>
                      <button 
                        className="btn-pay-card" 
                        onClick={() => finalizeTablePayment('CARD')}
                        disabled={ordersLoading}
                      >
                        💳 {t.pay} ({t.card})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>{t.cancel}</button>
              <button className="btn-save" onClick={saveTableChanges}>{t.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET IMPRIMABLE */}
      {printedOrder && <Receipt order={printedOrder} />}
    </div>
  );
};

export default Tables;
