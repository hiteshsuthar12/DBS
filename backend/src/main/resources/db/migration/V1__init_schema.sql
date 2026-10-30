-- Flyway Migration V1: Initial Enterprise Schema for Smart Inventory Management System

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    gst_number VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    purchase_price DECIMAL(12, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price DECIMAL(12, 2) NOT NULL CHECK (selling_price >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock_level INT NOT NULL DEFAULT 10 CHECK (minimum_stock_level >= 0),
    maximum_stock_level INT NOT NULL DEFAULT 500 CHECK (maximum_stock_level >= minimum_stock_level),
    reorder_level INT NOT NULL DEFAULT 20 CHECK (reorder_level >= 0),
    supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. STOCK TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL, -- IN, SALE, DAMAGED, EXPIRED, INTERNAL_USAGE, OTHER
    quantity INT NOT NULL CHECK (quantity > 0),
    previous_stock INT NOT NULL,
    updated_stock INT NOT NULL CHECK (updated_stock >= 0),
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    reference_number VARCHAR(100) NOT NULL,
    remarks TEXT,
    performed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. INVENTORY ALERTS TABLE
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(30) NOT NULL, -- LOW_STOCK, CRITICAL_STOCK, OUT_OF_STOCK, REORDER_REQUIRED
    current_stock INT NOT NULL,
    threshold_stock INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    message TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. PRODUCT DEMAND HISTORY TABLE (For AI & Analytics)
CREATE TABLE IF NOT EXISTS product_demand_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    demand_date DATE NOT NULL,
    quantity_demanded INT NOT NULL DEFAULT 0,
    transaction_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_product_demand_date UNIQUE (product_id, demand_date)
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    performed_by VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- PERFORMANCE & QUERY INDEXES
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_alerts_product_status ON inventory_alerts(product_id, status);
CREATE INDEX IF NOT EXISTS idx_demand_history_product_date ON product_demand_history(product_id, demand_date);

