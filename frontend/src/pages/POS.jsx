import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../context/translations';
import Receipt from '../components/Receipt';
import './POS.css';

import API_URL from '../config';

const POS = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [orderComment, setOrderComment] = useState('');
  const [printedOrder, setPrintedOrder] = useState(null);

  // Options Modal State
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [currentOptionProduct, setCurrentOptionProduct] = useState(null);
  const [isMenuSelected, setIsMenuSelected] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);

  const { language, formatPrice } = useSettings();
  const t = translations[language];

  // Fetch initial data (categories and products)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls later if needed, but for now we'll fetch from our backend
        const catRes = await fetch(`${API_URL}/categories`);
        const prodRes = await fetch(`${API_URL}/products`);
        const tablesRes = await fetch(`${API_URL}/tables`);
        const usersRes = await fetch(`${API_URL}/users`);
        
        let cats = [];
        let prods = [];
        let tbls = [];
        let usrs = [];
        
        if (catRes.ok) cats = await catRes.json();
        if (prodRes.ok) prods = await prodRes.json();
        if (tablesRes.ok) tbls = await tablesRes.json();
        if (usersRes.ok) usrs = await usersRes.json();

        // Si la base de données est vide, on utilise des données fictives pour la démo
        if (cats.length === 0) {
          cats = [
            { id: 1, name: 'Burgers' },
            { id: 2, name: 'Boissons' },
            { id: 3, name: 'Desserts' }
          ];
          prods = [
            { id: 1, name: 'Classic Burger', price: 8.50, category_id: 1, image_url: '🍔' },
            { id: 2, name: 'Cheese Burger', price: 9.50, category_id: 1, image_url: '🍔' },
            { id: 3, name: 'Coca Cola', price: 2.50, category_id: 2, image_url: '🥤' },
            { id: 4, name: 'Fanta', price: 2.50, category_id: 2, image_url: '🥤' },
            { id: 5, name: 'Tiramisu', price: 4.50, category_id: 3, image_url: '🍰' },
            { id: 6, name: 'Glace', price: 3.50, category_id: 3, image_url: '🍦' }
          ];
        }

        setCategories(cats);
        setProducts(prods);
        setTablesList(tbls);
        setUsersList(usrs);
        if (usrs.length > 0) setSelectedUser(usrs[0].id);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (product) => {
    // Check stock via ingredients
    const missingIngredients = product.ingredients 
      ? product.ingredients.filter(i => i.stock < i.needed).map(i => i.name)
      : [];
    
    if (missingIngredients.length > 0) {
      alert(`Impossible d'ajouter au panier : ${missingIngredients.join(', ')} hors stock !`);
      return;
    }

    const mainCategories = ['Chicken Burgers', 'Beef Burgers (Smashed)', 'Sandwiches', 'Tacos', 'Burgers'];
    const categoryName = categories.find(c => c.id === product.category_id)?.name;

    if (mainCategories.includes(categoryName)) {
      setCurrentOptionProduct(product);
      setIsOptionModalOpen(true);
      setIsMenuSelected(false);
      setSelectedDrink(null);
      setSelectedSide(null);
      setSelectedToppings([]);
      setSelectedExtras([]);
      return;
    }

    const existing = cart.find(item => item.id === product.id && !item.options);
    if (existing) {
      setCart(cart.map(item => (item.id === product.id && !item.options) ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const addCustomizedItemToCart = () => {
    let finalPrice = Number(currentOptionProduct.price);
    let optionsText = [];

    if (isMenuSelected) {
      finalPrice += 20; // Prix du menu par défaut
      optionsText.push("MENU");
      if (selectedDrink) optionsText.push(selectedDrink.name);
      if (selectedSide) optionsText.push(selectedSide.name);
    }

    selectedToppings.forEach(t => {
      finalPrice += Number(t.price);
      optionsText.push(`+${t.name}`);
    });

    selectedExtras.forEach(e => {
      finalPrice += Number(e.price);
      optionsText.push(`+${e.name}`);
    });

    const newItem = {
      ...currentOptionProduct,
      price: finalPrice,
      quantity: 1,
      options: optionsText.join(', '),
      uniqueKey: Date.now() // Pour différencier les menus différents
    };

    setCart([...cart, newItem]);
    setIsOptionModalOpen(false);
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing.quantity > 1) {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const processPayment = async (method) => {
    setIsCheckingOut(true);

    try {
      const orderData = {
        table_id: selectedTable ? parseInt(selectedTable, 10) : null,
        user_id: selectedUser ? parseInt(selectedUser, 10) : null,
        items: cart,
        payment_method: method === 'PENDING' ? null : method,
        status: method === 'PENDING' ? 'PENDING' : 'PAID',
        comment: orderComment
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const result = await res.json();
        alert(method === 'PENDING' ? 'Commande ajoutée à la table !' : `Succès : ${result.message}\nNuméro de commande : ${result.orderId}`);
        if (method !== 'PENDING') {
          const tableNum = tablesList.find(t => t.id === parseInt(selectedTable))?.table_number;
          const waiterName = usersList.find(u => u.id === parseInt(selectedUser))?.username;
          
          setPrintedOrder({
            items: cart,
            table_number: tableNum,
            waiter_name: waiterName
          });
          
          // Petit délai pour laisser React faire le rendu avant l'impression
          setTimeout(() => {
            window.print();
          }, 500);
        }

        setCart([]); // Vider le panier
        setOrderComment(''); // Reset comment
        setIsCheckoutModalOpen(false); // Fermer la modale
        setSelectedTable(''); // Reset table selection
      } else {
        alert("Erreur lors de l'encaissement.");
      }
    } catch (error) {
      console.error("Erreur d'encaissement", error);
      alert("Erreur réseau lors de l'encaissement.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  if (loading) return <div className="pos-loading">Chargement du menu...</div>;

  return (
    <div className="pos-container">
      {/* SECTION GAUCHE : MENU */}
      <div className="pos-menu-section">
        {/* Categories Bar */}
        <div className="categories-bar glass-panel">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => {
            const missingIngredients = product.ingredients 
              ? product.ingredients.filter(i => i.stock < i.needed).map(i => i.name)
              : [];
            
            const allMissing = product.ingredients && product.ingredients.length > 0 && missingIngredients.length === product.ingredients.length;
            const isOutOfStock = missingIngredients.length > 0;

            let stockLabel = '';
            if (allMissing) {
              stockLabel = 'Hors stock';
            } else if (isOutOfStock) {
              stockLabel = `${missingIngredients.join(', ')} hors stock`;
            }

            return (
              <div 
                key={product.id} 
                className={`product-card glass-panel ${isOutOfStock ? 'out-of-stock' : ''}`} 
                onClick={() => !isOutOfStock && addToCart(product)}
              >
                <div className="product-image">
                  {product.image_url && (product.image_url.includes('/') || product.image_url.includes('.')) ? (
                    <img src={product.image_url} alt={product.name} className="product-img-real" />
                  ) : (
                    product.image_url || '🍽️'
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  {isOutOfStock && <span className="stock-label">{stockLabel}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION DROITE : PANIER */}
      <div className="pos-cart-section glass-panel">
        <h2>Commande en cours</h2>

        {selectedTable && (
          <div className="table-selector-container">
            <label htmlFor="user-select">Serveur :</label>
            <select 
              id="user-select" 
              className="table-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {usersList.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
        )}

        <div className="table-selector-container">
          <label htmlFor="table-select">Assigner à une table :</label>
          <select 
            id="table-select" 
            className="table-select"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Vente directe (Pas de table)</option>
            {tablesList.map(table => (
              <option key={table.id} value={table.id}>
                Table {table.table_number} ({table.status === 'AVAILABLE' ? 'Libre' : 'Occupée'})
              </option>
            ))}
          </select>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Le panier est vide</div>
          ) : (
            cart.map(item => (
              <div key={item.uniqueKey || item.id} className="cart-item">
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  {item.options && <p className="item-options">{item.options}</p>}
                  <p>{formatPrice(item.price)}</p>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => removeFromCart(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="comment-section">
            <label>Note / Commentaire :</label>
            <textarea 
              className="comment-textarea" 
              placeholder="Ex: Sans oignons, bien cuit..."
              value={orderComment}
              onChange={(e) => setOrderComment(e.target.value)}
            />
          </div>
        )}

        <div className="cart-summary">
          <div className="summary-row">
            <span>{t.total}</span>
            <span className="total-amount">{formatPrice(calculateTotal())}</span>
          </div>
          <button 
            className="checkout-btn" 
            disabled={cart.length === 0 || isCheckingOut}
            onClick={() => {
              if (selectedTable) {
                processPayment('PENDING');
              } else {
                handleCheckout();
              }
            }}
          >
            {isCheckingOut ? '...' : (selectedTable ? t.add_to_table : t.pay)}
          </button>
        </div>
      </div>

      {/* --- CHECKOUT MODAL --- */}
      {isCheckoutModalOpen && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-content glass-panel">
            <div className="modal-header">
              <h2>Détail de l'addition</h2>
              <button className="close-btn" onClick={() => setIsCheckoutModalOpen(false)}>&times;</button>
            </div>
            
            <div className="receipt-body">
              <div className="receipt-list">
                {cart.map(item => (
                  <div key={item.id} className="receipt-item">
                    <span className="receipt-item-qty">{item.quantity}x</span>
                    <span className="receipt-item-name">{item.name}</span>
                    <span className="receipt-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              
              <div className="receipt-total-section">
                <span>{t.total}</span>
                <span className="receipt-total-amount">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <div className="payment-options">
              <button 
                className="payment-btn btn-card" 
                onClick={() => processPayment('CARD')}
                disabled={isCheckingOut}
              >
                💳 {t.card}
              </button>
              <button 
                className="payment-btn btn-cash" 
                onClick={() => processPayment('CASH')}
                disabled={isCheckingOut}
              >
                💵 {t.cash}
              </button>
            </div>
            {isCheckingOut && <p className="payment-loading">Traitement du paiement en cours...</p>}
          </div>
        </div>
      )}

      {/* MODAL OPTIONS */}
      {isOptionModalOpen && currentOptionProduct && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel option-modal">
            <div className="modal-header">
              <h2>{currentOptionProduct.name}</h2>
              <button className="close-btn" onClick={() => setIsOptionModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="option-group menu-toggle">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isMenuSelected} 
                    onChange={(e) => setIsMenuSelected(e.target.checked)} 
                  />
                  <span className="checkmark"></span>
                  Passer en MENU (+20 DH)
                </label>
              </div>

              {isMenuSelected && (
                <>
                  <div className="option-group">
                    <label>Boisson :</label>
                    <div className="options-grid">
                      {products.filter(p => categories.find(c => c.id === p.category_id)?.name === 'Drinks').map(drink => (
                        <button 
                          key={drink.id}
                          className={`opt-btn ${selectedDrink?.id === drink.id ? 'active' : ''}`}
                          onClick={() => setSelectedDrink(drink)}
                        >
                          {drink.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="option-group">
                    <label>Accompagnement (Menu) :</label>
                    <div className="options-grid">
                      {products.filter(p => 
                        categories.find(c => c.id === p.category_id)?.name === 'Sides' && 
                        (p.name.includes('Frites') || p.name.includes('Potatoes'))
                      ).map(side => (
                        <button 
                          key={side.id}
                          className={`opt-btn ${selectedSide?.id === side.id ? 'active' : ''}`}
                          onClick={() => setSelectedSide(side)}
                        >
                          {side.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="option-group">
                <label>Extras (Sides) :</label>
                <div className="options-grid">
                  {products.filter(p => 
                    categories.find(c => c.id === p.category_id)?.name === 'Sides' && 
                    !p.name.includes('Frites') && !p.name.includes('Potatoes')
                  ).map(extra => (
                    <button 
                      key={extra.id}
                      className={`opt-btn topping-btn ${selectedExtras.find(e => e.id === extra.id) ? 'active' : ''}`}
                      onClick={() => {
                        if (selectedExtras.find(e => e.id === extra.id)) {
                          setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
                        } else {
                          setSelectedExtras([...selectedExtras, extra]);
                        }
                      }}
                    >
                      <div className="opt-img-wrapper">
                        {extra.image_url && (extra.image_url.includes('/') || extra.image_url.includes('.')) ? (
                          <img src={extra.image_url} alt={extra.name} />
                        ) : (
                          <span>🍟</span>
                        )}
                      </div>
                      <div className="opt-info">
                        <span className="opt-name">{extra.name}</span>
                        <span className="opt-price">+{extra.price} DH</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Toppings (Suppléments) :</label>
                <div className="options-grid">
                  {products.filter(p => categories.find(c => c.id === p.category_id)?.name === 'Toppings').map(topping => (
                    <button 
                      key={topping.id}
                      className={`opt-btn topping-btn ${selectedToppings.find(t => t.id === topping.id) ? 'active' : ''}`}
                      onClick={() => {
                        if (selectedToppings.find(t => t.id === topping.id)) {
                          setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
                        } else {
                          setSelectedToppings([...selectedToppings, topping]);
                        }
                      }}
                    >
                      <div className="opt-img-wrapper">
                        {topping.image_url && (topping.image_url.includes('/') || topping.image_url.includes('.')) ? (
                          <img src={topping.image_url} alt={topping.name} />
                        ) : (
                          <span>✨</span>
                        )}
                      </div>
                      <div className="opt-info">
                        <span className="opt-name">{topping.name}</span>
                        <span className="opt-price">+{topping.price} DH</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="price-preview">
                Total: {formatPrice(
                  Number(currentOptionProduct.price) + 
                  (isMenuSelected ? 20 : 0) + 
                  selectedToppings.reduce((s, t) => s + Number(t.price), 0) +
                  selectedExtras.reduce((s, e) => s + Number(e.price), 0)
                )}
              </div>
              <button className="checkout-btn" onClick={addCustomizedItemToCart}>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET IMPRIMABLE */}
      {printedOrder && <Receipt order={printedOrder} />}
    </div>
  );
};

export default POS;
