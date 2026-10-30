-- Flyway Migration V2: Initial Enterprise Seed Data

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Administrator with full system privileges and configuration management'),
(2, 'ROLE_INVENTORY_MANAGER', 'Inventory Manager with product, supplier, and stock authorization'),
(3, 'ROLE_STAFF', 'Operations Staff with stock movement and read privileges')
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, description, created_at) VALUES
(1, 'Electronics', 'Integrated circuits, semiconductors, sensors, and electronic sub-assemblies', NOW()),
(2, 'Industrial Hardware', 'Fasteners, bearings, valves, fittings, and industrial mechanical supplies', NOW()),
(3, 'Power & Electrical', 'Industrial power supplies, transformers, cables, breakers, and distribution units', NOW()),
(4, 'Tools & Instruments', 'Measurement meters, calibration devices, soldering stations, and hand tools', NOW()),
(5, 'Packaging & Logistics', 'Corrugated boxes, protective wrap, ESD packaging, and shipping materials', NOW()),
(6, 'Office & Workspace', 'Ergonomic furnishings, technical desks, and inventory workstation supplies', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. SUPPLIERS
INSERT INTO suppliers (id, supplier_name, company_name, email, phone, address, contact_person, gst_number, status, created_at, updated_at) VALUES
(1, 'TechSource Global', 'TechSource Global Solutions Pvt Ltd', 'procurement@techsource.com', '+91 98765 43210', 'Block B, Sector 62, Electronic City, Bengaluru, Karnataka 560100', 'Rajesh Sharma', '29AABCT1332L1Z5', 'ACTIVE', NOW(), NOW()),
(2, 'Apex Industrial', 'Apex Industrial Fasteners & Hardware Ltd', 'sales@apexindustrial.com', '+91 98220 11223', 'Plot 45, MIDC Industrial Area, Chakan, Pune, Maharashtra 410501', 'Sunita Deshmukh', '27AAACA9876D1Z2', 'ACTIVE', NOW(), NOW()),
(3, 'Voltaic Systems', 'Voltaic Electrical Technologies Inc', 'orders@voltaicsys.com', '+91 94440 99887', 'Phase II, SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu 600032', 'Arun Karthik', '33AABCV5544K1ZR', 'ACTIVE', NOW(), NOW()),
(4, 'Precision Instruments', 'Precision Tools & Metrology Pvt Ltd', 'support@precisiontools.in', '+91 99100 55443', 'Udyog Vihar Phase 4, Gurugram, Haryana 122015', 'Vikram Malhotra', '06AAACP4433P1Z9', 'ACTIVE', NOW(), NOW()),
(5, 'EcoPack Materials', 'EcoPack Sustainable Packaging Solutions', 'info@ecopack.co.in', '+91 97120 77889', 'GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat 382445', 'Meera Patel', '24AABCE8899M1Z8', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTS (Real products spanning healthy, low-stock, critical, and out-of-stock)
INSERT INTO products (id, name, sku, description, category_id, unit, purchase_price, selling_price, current_stock, minimum_stock_level, maximum_stock_level, reorder_level, supplier_id, version, created_at, updated_at) VALUES
(1, 'Microcontroller STM32F4 Cortex-M4', 'ELEC-MCU-3201', '32-bit ARM Cortex-M4 MCU with 512KB Flash, 168 MHz high-performance processor', 1, 'PCS', 650.00, 950.00, 140, 25, 500, 50, 1, 0, NOW() - INTERVAL '30 days', NOW()),
(2, 'Industrial Power Supply 24V 10A DIN Rail', 'PWR-DR24-1002', 'Ultra-slim 240W DIN-rail industrial power supply with overload protection', 3, 'PCS', 2200.00, 3100.00, 18, 10, 100, 25, 3, 0, NOW() - INTERVAL '30 days', NOW()),
(3, 'Digital True-RMS Multimeter 600V CAT III', 'TOOL-DMM-6003', 'Professional auto-ranging digital multimeter with temperature sensor and backlight', 4, 'PCS', 3400.00, 4800.00, 42, 10, 120, 20, 4, 0, NOW() - INTERVAL '30 days', NOW()),
(4, 'Stainless Steel Hex Bolt M8 x 40mm (Pack of 100)', 'HDW-BLT-M804', 'Grade 304 corrosion-resistant stainless steel hex head machine screws', 2, 'BOX', 420.00, 680.00, 12, 15, 300, 30, 2, 0, NOW() - INTERVAL '30 days', NOW()),
(5, 'Temperature & Humidity Sensor Modbus RTU', 'ELEC-THS-0505', 'High-accuracy industrial RS485 Modbus RTU temperature and humidity transmitter', 1, 'PCS', 1150.00, 1750.00, 8, 10, 150, 25, 1, 0, NOW() - INTERVAL '30 days', NOW()),
(6, 'Soldering Station 90W ESD Safe with Display', 'TOOL-SLD-9006', 'Microprocessor-controlled PID precision soldering station with sleep mode', 4, 'PCS', 4500.00, 6200.00, 3, 5, 50, 12, 4, 0, NOW() - INTERVAL '30 days', NOW()),
(7, 'Multi-Strand Copper Wire Spool 1.5 sq mm 90m', 'PWR-CBL-1507', 'Flame-retardant PVC insulated flexible industrial electrical wiring spool', 3, 'BOX', 1850.00, 2550.00, 65, 20, 200, 40, 3, 0, NOW() - INTERVAL '30 days', NOW()),
(8, 'Anti-Static ESD Bubble Wrap Roll 50m x 1m', 'PKG-ESD-5008', 'Dissipative pink cushioning material for safe transportation of sensitive components', 5, 'PCS', 1250.00, 1800.00, 0, 5, 60, 15, 5, 0, NOW() - INTERVAL '30 days', NOW()),
(9, 'Ergonomic Technical Workstation Chair', 'OFF-CHR-ERG9', 'High-durability pneumatic lumbar-support ESD fabric chair for assembly technicians', 6, 'PCS', 7800.00, 10500.00, 14, 5, 40, 10, 2, 0, NOW() - INTERVAL '30 days', NOW()),
(10, 'Heavy Duty 5-Ply Corrugated Shipping Box (Pack of 50)', 'PKG-BOX-5P10', 'Bursting strength 14 kg/cm² double wall corrugated shipping packaging', 5, 'BOX', 950.00, 1450.00, 85, 20, 400, 50, 5, 0, NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. INITIAL ALERTS FOR LOW / CRITICAL / OUT-OF-STOCK
INSERT INTO inventory_alerts (product_id, alert_type, current_stock, threshold_stock, status, message, created_at, updated_at) VALUES
(4, 'LOW_STOCK', 12, 30, 'ACTIVE', 'Product stock (12) is below reorder level (30). Trigger reorder with Apex Industrial.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(5, 'LOW_STOCK', 8, 25, 'ACTIVE', 'Product stock (8) is below reorder level (25). Urgent stock replenishment recommended.', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
(6, 'CRITICAL_STOCK', 3, 12, 'ACTIVE', 'Critical stock level (3 units) remaining. Reorder threshold is 12.', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
(8, 'OUT_OF_STOCK', 0, 15, 'ACTIVE', 'Product is completely OUT OF STOCK (0 units). Customer orders will be blocked.', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

-- Reset sequences to prevent key collision on subsequent insertions
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM suppliers));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

