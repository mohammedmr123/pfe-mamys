import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import './Receipt.css';

const Receipt = ({ order, restaurantName = "RestoSync", address = "123 Rue du Restaurant, Casablanca" }) => {
  const { formatPrice } = useSettings();
  
  if (!order) return null;

  const total = order.items.reduce((sum, item) => sum + (item.price || item.unit_price) * item.quantity, 0);

  return (
    <div className="receipt-container" id="printable-receipt">
      <div className="receipt-header">
        <h2>{restaurantName}</h2>
        <p>{address}</p>
        <p>Tél: +212 5XX XX XX XX</p>
      </div>

      <div className="receipt-divider"></div>

      <div className="receipt-info">
        <p>Date: {new Date().toLocaleString()}</p>
        <p>Table: {order.table_number || 'Vente Directe'}</p>
        {order.waiter_name && <p>Serveur: {order.waiter_name}</p>}
      </div>

      <div className="receipt-divider"></div>

      <table className="receipt-items">
        <thead>
          <tr>
            <th>Article</th>
            <th>Qté</th>
            <th>Prix</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td>{item.name || item.product_name}</td>
              <td>{item.quantity}</td>
              <td>{formatPrice((item.price || item.unit_price) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-divider"></div>

      <div className="receipt-total">
        TOTAL: {formatPrice(total)}
      </div>

      <div className="receipt-footer">
        <p>Merci de votre visite !</p>
        <div className="receipt-qr">
          <QRCodeSVG value="https://mammys-burger.showcase" size={80} />
        </div>
        <p style={{ marginTop: '2mm', fontSize: '0.7rem' }}>Scannez pour nous suivre</p>
      </div>
    </div>
  );
};

export default Receipt;
