import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import './Menu.css';

const Menu = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for new, {id...} for edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`)
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'categories') {
      setFormData(item ? { name: item.name } : { name: '' });
    } else {
      setFormData(item ? { ...item } : { name: '', price: '', category_id: categories[0]?.id, description: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/${activeTab}${editingItem ? `/${editingItem.id}` : ''}`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchData();
        setIsModalOpen(false);
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/${activeTab}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="pos-loading">Chargement du menu...</div>;

  return (
    <div className="menu-mgmt-container">
      <div className="tables-header">
        <h1>Gestion du Menu</h1>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          + Ajouter {activeTab === 'categories' ? 'une Catégorie' : 'un Produit'}
        </button>
      </div>

      <div className="menu-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produits
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Catégories
        </button>
      </div>

      <div className="mgmt-table-container glass-panel">
        <table className="mgmt-table">
          <thead>
            {activeTab === 'products' ? (
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            ) : (
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'products' ? (
              products.map(p => (
                <tr key={p.id}>
                  <td>{p.image_url || '🍽️'}</td>
                  <td>{p.name}</td>
                  <td>{Number(p.price).toFixed(2)} €</td>
                  <td>{p.stock_quantity}</td>
                  <td>{categories.find(c => c.id === p.category_id)?.name || 'N/A'}</td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleOpenModal(p)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.name}</td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleOpenModal(c)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(c.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="menu-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="menu-modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'categories' ? 'Catégorie' : 'Produit'}</h2>
            
            <form className="menu-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom :</label>
                <input 
                  required
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              {activeTab === 'products' && (
                <>
                  <div className="form-group">
                    <label>Prix (€) :</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price || ''} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantité en Stock :</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock_quantity || ''} 
                      onChange={e => setFormData({...formData, stock_quantity: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Catégorie :</label>
                    <select 
                      value={formData.category_id || ''} 
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Emoji Image :</label>
                    <input 
                      type="text" 
                      placeholder="🍔, 🍕, etc."
                      value={formData.image_url || ''} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-save">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
