-- 1. Utilisateurs (Admin, Caissier)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CASHIER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tables du restaurant
CREATE TABLE restaurant_tables (
    id SERIAL PRIMARY KEY,
    table_number INT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED')),
    guests_count INT DEFAULT 0
);

-- 3. Catégories de produits
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Produits (Plats, Boissons)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 5. Commandes ("Orders")
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES restaurant_tables(id),
    user_id INT REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'CARD', NULL)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lignes de la commande ("Order Items")
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
