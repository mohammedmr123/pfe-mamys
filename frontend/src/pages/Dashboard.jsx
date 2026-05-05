import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../context/translations';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({ total_revenue: 0, total_orders: 0, avg_basket: 0 });
  const [trendData, setTrendData] = useState([]);
  const [serverStats, setServerStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [period, setPeriod] = useState('day');
  const [loading, setLoading] = useState(true);
  const { language, formatPrice } = useSettings();
  const t = translations[language];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(false); // background fetch
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [period]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [sumRes, trendRes, serverRes, prodRes, payRes] = await Promise.all([
        fetch(`${API_URL}/stats/summary`),
        fetch(`http://localhost:5000/api/stats/trend?period=${period}`),
        fetch(`${API_URL}/stats/servers`),
        fetch(`${API_URL}/stats/products`),
        fetch(`${API_URL}/stats/payments`)
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
      if (serverRes.ok) setServerStats(await serverRes.json());
      if (prodRes.ok) setTopProducts(await prodRes.json());
      if (payRes.ok) {
        const data = await payRes.json();
        setPaymentStats(data.map(item => ({
          name: item.payment_method === 'CASH' ? t.cash : t.card,
          value: parseFloat(item.total)
        })));
      }
    } catch (error) {
      console.error("Erreur de chargement des stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && trendData.length === 0) return <div className="pos-loading">Chargement des analyses...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <div className="live-badge">
          <span className="dot"></span> LIVE
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-summary">
        <div className="stat-card glass-panel">
          <h3>{t.revenue}</h3>
          <div className="stat-value">{formatPrice(summary.total_revenue)}</div>
          <div className="icon">💰</div>
        </div>
        <div className="stat-card glass-panel">
          <h3>{t.orders_today}</h3>
          <div className="stat-value">{summary.total_orders}</div>
          <div className="icon">🛒</div>
        </div>
        <div className="stat-card glass-panel">
          <h3>{t.avg_basket}</h3>
          <div className="stat-value">{formatPrice(summary.avg_basket)}</div>
          <div className="icon">📊</div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="charts-grid">
        <div className="chart-panel glass-panel">
          <div className="chart-header">
            <h2>{t.evolution}</h2>
            <div className="chart-filters">
              <button className={`filter-btn ${period === 'day' ? 'active' : ''}`} onClick={() => setPeriod('day')}>{t.day}</button>
              <button className={`filter-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>{t.month}</button>
              <button className={`filter-btn ${period === 'year' ? 'active' : ''}`} onClick={() => setPeriod('year')}>{t.year}</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-panel glass-panel">
          <div className="chart-header">
            <h2>Modes de Paiement</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={paymentStats}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="bottom-grid">
        {/* Servers Performance */}
        <div className="list-panel glass-panel">
          <h2>{t.servers}</h2>
          <div className="data-list">
            {serverStats.map((server, index) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <span className="item-name">{server.username}</span>
                  <span className="item-sub">{server.order_count} {t.orders_today}</span>
                </div>
                <div className="item-value">{formatPrice(server.total_sales)}</div>
              </div>
            ))}
            {serverStats.length === 0 && <p className="no-orders">Aucune donnée</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="list-panel glass-panel">
          <h2>{t.top_products}</h2>
          <div className="data-list">
            {topProducts.map((prod, index) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <span className="item-name">{prod.name}</span>
                  <span className="item-sub">Vendus</span>
                </div>
                <div className="item-value">{prod.total_qty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="list-panel glass-panel" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' }}>
          <h2>💡 Analyse IA</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {serverStats.length > 0 ? (
              `Le serveur ${serverStats[0].username} est actuellement le plus performant avec ${Number(serverStats[0].total_sales).toFixed(2)} € de ventes. `
            ) : ''}
            Pensez à proposer des promotions sur les produits moins vendus pour équilibrer votre stock.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
