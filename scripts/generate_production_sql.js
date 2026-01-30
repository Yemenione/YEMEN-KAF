const fs = require('fs');
const bcrypt = require('bcrypt');

async function generate() {
    console.log("Generating SQL seed file...");
    const passwordHash = await bcrypt.hash('password123', 10);

    // Helper for JSON escaping
    const json = (obj) => JSON.stringify(obj).replace(/'/g, "\\'");

    let sql = `-- Yemeni Market Master Production Seed
-- Generated automatically

-- ==========================================
-- 1. USERS & AUTH
-- ==========================================
INSERT INTO admins (email, password_hash, name, role, created_at, updated_at)
VALUES ('admin@yemeni-market.com', '${passwordHash}', 'Super Admin', 'SUPER_ADMIN', NOW(), NOW())
ON DUPLICATE KEY UPDATE role = 'SUPER_ADMIN';

INSERT INTO customers (email, first_name, last_name, password_hash, created_at)
VALUES ('demo@yemeni-market.com', 'Demo', 'User', '${passwordHash}', NOW())
ON DUPLICATE KEY UPDATE first_name = VALUES(first_name);

-- ==========================================
-- 2. CORE CONFIGURATION
-- ==========================================
-- Store Config
INSERT INTO store_config (\`key\`, value, \`group\`, type, isPublic, updated_at) VALUES 
('store_name', 'Yemeni Market', 'general', 'text', 1, NOW()),
('store_email', 'contact@yemeni-market.com', 'general', 'text', 1, NOW()),
('store_phone', '+33 6 00 00 00 00', 'general', 'text', 1, NOW()),
('store_address', '123 Avenue des Champs-Élysées, 75008 Paris', 'general', 'text', 1, NOW()),
('currency', 'EUR', 'general', 'text', 1, NOW())
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- App Config (Mobile/Frontend)
INSERT INTO app_configs (\`key\`, value, description, created_at, updated_at) VALUES
('maintenance_mode', '${json({ enabled: false, message: "We are under maintenance." })}', 'Toggle app access', NOW(), NOW()),
('contact_info', '${json({ whatsapp: "+33600000000", email: "contact@yemenkaf.com", phone: "+33100000000" })}', 'Contact details', NOW(), NOW()),
('home_banners', '${json([
        { id: 1, imageUrl: "/images/posters/poster-1.jpg", action: "none", target: "" },
        { id: 2, imageUrl: "/images/posters/poster-2.jpg", action: "category", target: "honey" }
    ])}', 'Home screen sliders', NOW(), NOW())
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Tax Rules
INSERT INTO tax_rules (name, rate, country, is_active, created_at, updated_at) VALUES
('TVA Standard (20%)', 20.00, 'FR', 1, NOW(), NOW()),
('TVA Réduite (5.5%)', 5.50, 'FR', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE rate = VALUES(rate);

-- ==========================================
-- 3. CATALOG STRUCTURE
-- ==========================================
-- Brands
INSERT INTO brands (name, slug, logo, description, is_active, created_at, updated_at) VALUES
('Al-Rajwi', 'al-rajwi', '/uploads/brands/al_rajwi.png', 'Famous Yemeni honey and spice brand.', 1, NOW(), NOW()),
('Al-Yemeniya', 'al-yemeniya', '/uploads/brands/al_yemeniya.png', 'Traditional authentic products from Yemen.', 1, NOW(), NOW()),
('Teashop', 'teashop', '/uploads/brands/teashop.png', 'Premium tea selections.', 1, NOW(), NOW()),
('Yem Kaf', 'yem-kaf', '/uploads/brands/yem_kaf.png', 'Our signature house brand.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Categories
INSERT INTO categories (name, slug, description, image_url, is_active, display_order, created_at) VALUES
('Yemeni Honey', 'honey', 'Authentic Sidr and Sumur honey.', '/images/honey-comb.jpg', 1, 1, NOW()),
('Yemeni Coffee', 'coffee', 'World-renowned coffee beans.', '/images/coffee-beans.jpg', 1, 2, NOW()),
('Gifts & Sets', 'gifts', 'Beautiful gift sets.', '/images/products/encensoir.jpg', 1, 3, NOW()),
('Wholesale', 'wholesale', 'Bulk quantities.', '/images/products/jarre-terre.jpg', 1, 4, NOW()),
('Spices', 'spices', 'Traditional spices.', '/images/products/henne-125.jpg', 1, 5, NOW())
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);

-- Attributes
INSERT INTO attributes (id, name, public_name, type) VALUES (1, 'Weight', 'Poids', 'select')
ON DUPLICATE KEY UPDATE public_name = VALUES(public_name);

INSERT INTO attribute_values (id, attribute_id, name, value, position) VALUES
(1, 1, '250g', '250', 1),
(2, 1, '500g', '500', 2),
(3, 1, '1kg', '1000', 3)
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- ==========================================
-- 4. PRODUCTS
-- ==========================================
INSERT INTO products (category_id, brand_id, tax_rule_id, name, slug, description, price, stock_quantity, weight, images, is_active, is_featured, created_at, updated_at) VALUES
-- Honey
((SELECT id FROM categories WHERE slug='honey' LIMIT 1), (SELECT id FROM brands WHERE slug='al-rajwi' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Royal Sidr Honey (Do\\'an)', 'royal-sidr-honey', 'Premium grade Sidr honey from the Do\\'an valley. Known for its medicinal properties and exquisite taste.', 120.00, 50, 0.5, '${json(["/images/honey-jar.jpg"])}', 1, 1, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='honey' LIMIT 1), (SELECT id FROM brands WHERE slug='al-yemeniya' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Sumur (Acacia) Honey', 'sumur-honey', 'Dark, rich honey from the Acacia tree. Excellent for respiratory health.', 85.00, 30, 0.5, '${json(["/images/honey-jar.jpg"])}', 1, 0, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='honey' LIMIT 1), (SELECT id FROM brands WHERE slug='yem-kaf' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'White Honey (Majra)', 'white-honey', 'Rare white honey with a creamy texture and delicate floral taste.', 150.00, 15, 0.5, '${json(["/images/honey-jar.jpg"])}', 1, 1, NOW(), NOW()),

-- Coffee
((SELECT id FROM categories WHERE slug='coffee' LIMIT 1), (SELECT id FROM brands WHERE slug='al-yemeniya' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Ibini Classic Coffee', 'ibini-coffee', 'Traditional Yemeni coffee beans, naturally processed.', 35.00, 100, 0.25, '${json(["/images/coffee-beans.jpg"])}', 1, 1, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='coffee' LIMIT 1), (SELECT id FROM brands WHERE slug='yem-kaf' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Khawlani Coffee Premium', 'khawlani-coffee', 'Premium Khawlani beans, known for their rich body and chocolate notes.', 40.00, 80, 0.25, '${json(["/images/coffee-beans.jpg"])}', 1, 1, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='coffee' LIMIT 1), (SELECT id FROM brands WHERE slug='yem-kaf' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Qishr (Coffee Husks)', 'qishr', 'Traditional dried coffee husks used to make a tea-like beverage (Qishr).', 15.00, 150, 0.20, '${json(["/images/coffee-beans.jpg"])}', 1, 0, NOW(), NOW()),

-- Gifts
((SELECT id FROM categories WHERE slug='gifts' LIMIT 1), (SELECT id FROM brands WHERE slug='yem-kaf' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=20.00 LIMIT 1), 'Luxury Honey Gift Box', 'honey-gift-box', 'A selection of our finest honeys in a handcrafted wooden box. Perfect for Ramadan gifts.', 250.00, 10, 2.5, '${json(["/images/products/encensoir.jpg"])}', 1, 1, NOW(), NOW()),

-- Spices
((SELECT id FROM categories WHERE slug='spices' LIMIT 1), (SELECT id FROM brands WHERE slug='al-rajwi' LIMIT 1), (SELECT id FROM tax_rules WHERE rate=5.50 LIMIT 1), 'Hawaij Spice Mix', 'hawaij-spice-mix', 'Essential Yemeni spice blend for coffee and tea.', 15.00, 200, 0.1, '${json(["/images/products/henne-250.jpg"])}', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Product Variants (Example for Royal Sidr)
SET @sidr_id = (SELECT id FROM products WHERE slug='royal-sidr-honey' LIMIT 1);
INSERT INTO product_variants (product_id, name, sku, price, stock, is_active) VALUES
(@sidr_id, '250g Pot', 'SIDR-250G', 65.00, 100, 1),
(@sidr_id, '500g Pot', 'SIDR-500G', 120.00, 50, 1),
(@sidr_id, '1kg Pot', 'SIDR-1KG', 230.00, 20, 1)
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Variant Values Linking
INSERT IGNORE INTO product_variant_values (variant_id, attribute_value_id) VALUES
((SELECT id FROM product_variants WHERE sku='SIDR-250G' LIMIT 1), 1),
((SELECT id FROM product_variants WHERE sku='SIDR-500G' LIMIT 1), 2),
((SELECT id FROM product_variants WHERE sku='SIDR-1KG' LIMIT 1), 3);

-- Reviews
INSERT INTO reviews (product_id, customer_id, rating, comment, is_verified, created_at) VALUES
(@sidr_id, (SELECT id FROM customers WHERE email='demo@yemeni-market.com' LIMIT 1), 5, 'Le meilleur miel que j\\'ai jamais goûté ! Une texture incroyable.', 1, NOW()),
(@sidr_id, (SELECT id FROM customers WHERE email='demo@yemeni-market.com' LIMIT 1), 4, 'Très bon produit, mais la livraison a pris un peu de temps.', 1, NOW())
ON DUPLICATE KEY UPDATE rating = VALUES(rating);

-- ==========================================
-- 5. LOGISTICS (Carriers & Rates)
-- ==========================================
INSERT INTO carriers (name, code, logo, delivery_time, description, is_active, created_at, updated_at) VALUES
('Colissimo', 'colissimo', '/uploads/carriers/colissimo.png', '48h-72h', 'Standard home delivery.', 1, NOW(), NOW()),
('Mondial Relay', 'mondial_relay', '/uploads/carriers/mondial_relay.png', '3-5 days', 'Pickup point delivery (Economical).', 1, NOW(), NOW()),
('DHL Express', 'dhl', '/uploads/carriers/dhl.png', '24h (Europe)', 'Fast international delivery.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Zones
INSERT INTO shipping_zones (name, countries, is_active) VALUES
('France Metropolitaine', '["FR", "MC", "AD"]', 1),
('Europe', '["DE", "BE", "NL", "LU", "IT", "ES", "PT", "AT", "IE", "SE", "DK", "FI", "GR", "PL", "CZ", "HU"]', 1),
('International', '["US", "CA", "GB", "SA", "AE", "KW", "QA", "OM", "YE"]', 1)
ON DUPLICATE KEY UPDATE countries = VALUES(countries);

-- Rates (Simple Refresh)
TRUNCATE TABLE shipping_rates;
INSERT INTO shipping_rates (zone_id, carrier_id, min_weight, max_weight, price) VALUES
((SELECT id FROM shipping_zones WHERE name='France Metropolitaine' LIMIT 1), (SELECT id FROM carriers WHERE code='colissimo' LIMIT 1), 0, 1000, 7.95),
((SELECT id FROM shipping_zones WHERE name='France Metropolitaine' LIMIT 1), (SELECT id FROM carriers WHERE code='mondial_relay' LIMIT 1), 0, 1000, 4.90),
((SELECT id FROM shipping_zones WHERE name='Europe' LIMIT 1), (SELECT id FROM carriers WHERE code='dhl' LIMIT 1), 0, 1000, 19.90),
((SELECT id FROM shipping_zones WHERE name='International' LIMIT 1), (SELECT id FROM carriers WHERE code='dhl' LIMIT 1), 0, 1000, 39.90);

    `;

    fs.writeFileSync('yemeni_market_seed.sql', sql);
    console.log("Created master yemeni_market_seed.sql successfully.");
}

generate().catch(console.error);
