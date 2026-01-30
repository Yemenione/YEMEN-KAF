import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

async function main() {
    console.log('Starting seed (aligned with Navbar)...');

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
        throw new Error('Missing database environment variables');
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Categories matched to Navbar links: honey, coffee, gifts, wholesale
        const categories = [
            {
                name: 'Royal Sidr Collection', // Was: Yemeni Honey
                slug: 'honey',
                description: 'Rare & Potent honey from the mountains of Yemen.',
                image_url: '/images/honey-jar.jpg',
                is_active: 1,
                display_order: 1
            },
            {
                name: 'Haraz Mocha Special', // Was: Yemeni Coffee
                slug: 'coffee',
                description: 'Estate Grown world-renowned coffee beans.',
                image_url: '/images/coffee-beans.jpg',
                is_active: 1,
                display_order: 2
            },
            {
                name: 'Luxury Gift Sets', // Was: Gifts & Sets
                slug: 'gifts',
                description: 'Perfect for Ramadan and special occasions.',
                image_url: '/images/products/encensoir.jpg',
                is_active: 1,
                display_order: 3
            },
            {
                name: 'Wholesale / Bulk',
                slug: 'wholesale',
                description: 'Bulk quantities for business.',
                image_url: '/images/products/jarre-terre.jpg', // Placeholder
                is_active: 1,
                display_order: 4
            },
            {
                name: 'Spices & Herbs',
                slug: 'spices', // Not in main nav but good to have
                description: 'Traditional spices.',
                image_url: '/images/products/henne-125.jpg',
                is_active: 1,
                display_order: 5
            }
        ];

        // Brands
        const brands = [
            {
                name: 'Al-Rajwi',
                slug: 'al-rajwi',
                logo: '/uploads/brands/al_rajwi.png', // Placeholder
                description: 'Famous Yemeni honey and spice brand.',
                is_active: 1
            },
            {
                name: 'Al-Yemeniya',
                slug: 'al-yemeniya',
                logo: '/uploads/brands/al_yemeniya.png', // Placeholder
                description: 'Traditional authentic products from Yemen.',
                is_active: 1
            },
            {
                name: 'Teashop',
                slug: 'teashop',
                logo: '/uploads/brands/teashop.png', // Placeholder
                description: 'Premium tea selections.',
                is_active: 1
            },
            {
                name: 'Yem Kaf',
                slug: 'yem-kaf',
                logo: '/uploads/brands/yem_kaf.png', // Placeholder
                description: 'Our signature house brand.',
                is_active: 1
            }
        ];

        console.log('Upserting Brands...');
        for (const brand of brands) {
            await connection.execute(`
                INSERT INTO brands (name, slug, logo, description, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    description = VALUES(description),
                    logo = VALUES(logo),
                    is_active = VALUES(is_active)
            `, [brand.name, brand.slug, brand.logo, brand.description, brand.is_active]);
        }

        for (const cat of categories) {
            console.log(`Upserting category: ${cat.name} (${cat.slug})`);
            await connection.execute(`
                INSERT INTO categories (name, slug, description, image_url, is_active, display_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    description = VALUES(description),
                    image_url = VALUES(image_url),
                    is_active = VALUES(is_active),
                    display_order = VALUES(display_order)
            `, [cat.name, cat.slug, cat.description, cat.image_url, cat.is_active, cat.display_order]);
        }

        // Helper to get Category ID
        async function getCatId(slug: string): Promise<number | undefined> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const [rows] = await connection.execute<any[]>('SELECT id FROM categories WHERE slug = ?', [slug]);
            return rows[0]?.id;
        }

        const honeyId = await getCatId('honey');
        const coffeeId = await getCatId('coffee');
        const giftsId = await getCatId('gifts');
        const spicesId = await getCatId('spices');

        // Products
        const products = [
            // Honey
            {
                category_id: honeyId,
                name: 'Royal Sidr Honey (Do\'an)',
                slug: 'royal-sidr-honey',
                description: 'Premium grade Sidr honey from the Do\'an valley.',
                price: 120.00,
                stock_quantity: 50,
                weight: 0.5, // 500g jar
                images: JSON.stringify(["/images/honey-jar.jpg"]),
                is_active: 1,
                is_featured: 1
            },
            {
                category_id: honeyId,
                name: 'Sumur (Acacia) Honey',
                slug: 'sumur-honey',
                description: 'Dark, rich honey from the Acacia tree.',
                price: 85.00,
                stock_quantity: 30,
                weight: 0.5, // 500g jar
                images: JSON.stringify(["/images/honey-jar.jpg"]),
                is_active: 1,
                is_featured: 0
            },
            // Coffee
            {
                category_id: coffeeId,
                name: 'Ibini Classic Coffee',
                slug: 'ibini-coffee',
                description: 'Traditional Yemeni coffee.',
                price: 35.00,
                stock_quantity: 100,
                weight: 0.25, // 250g bag
                images: JSON.stringify(["/images/coffee-beans.jpg"]),
                is_active: 1,
                is_featured: 1
            },
            // Spices
            {
                category_id: spicesId,
                name: 'Hawaij Spice Mix',
                slug: 'hawaij-spice-mix',
                description: 'Essential Yemeni spice blend for coffee.',
                price: 15.00,
                stock_quantity: 200,
                weight: 0.1, // 100g
                images: JSON.stringify(["/images/products/henne-250.jpg"]),
                is_active: 1,
                is_featured: 0
            },
            // Gifts
            {
                category_id: giftsId,
                name: 'Luxury Honey Gift Box',
                slug: 'honey-gift-box',
                description: 'A selection of our finest honeys in a wooden box.',
                price: 250.00,
                stock_quantity: 10,
                weight: 2.5, // 3x 500g jars + packaging
                images: JSON.stringify(["/images/products/encensoir.jpg"]),
                is_active: 1,
                is_featured: 1
            }
        ];

        for (const prod of products) {
            if (!prod.category_id) {
                console.warn(`Skipping product ${prod.name} (category not found)`);
                continue;
            }
            console.log(`Upserting product: ${prod.name}`);
            await connection.execute(`
                INSERT INTO products (category_id, name, slug, description, price, stock_quantity, weight, images, is_active, is_featured, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    category_id = VALUES(category_id),
                    name = VALUES(name),
                    description = VALUES(description),
                    price = VALUES(price),
                    stock_quantity = VALUES(stock_quantity),
                    weight = VALUES(weight),
                    images = VALUES(images),
                    is_active = VALUES(is_active),
                    is_featured = VALUES(is_featured),
                    updated_at = NOW()
            `, [prod.category_id, prod.name, prod.slug, prod.description, prod.price, prod.stock_quantity, prod.weight, prod.images, prod.is_active, prod.is_featured]);
        }

        // Carriers
        // Updated to enable ALL codes for seeding logic
        const carriers = [
            {
                name: 'Colissimo',
                code: 'colissimo',
                logo: '/uploads/carriers/colissimo.png',
                delivery_time: '48h-72h',
                description: 'Standard home delivery.',
                is_active: 1
            },
            {
                name: 'Mondial Relay',
                code: 'mondial_relay',
                logo: '/uploads/carriers/mondial_relay.png',
                delivery_time: '3-5 days',
                description: 'Pickup point delivery (Economical).',
                is_active: 1
            },
            {
                name: 'DHL Express',
                code: 'dhl',
                logo: '/uploads/carriers/dhl.png',
                delivery_time: '24h (Europe)',
                description: 'Fast international delivery.',
                is_active: 1
            },
            {
                name: 'FedEx',
                code: 'fedex', // Added code
                logo: null,
                delivery_time: '3-5 days',
                description: 'Secure international shipping.',
                is_active: 1
            },
            {
                name: 'UPS',
                code: 'ups',  // Added code
                logo: null,
                delivery_time: '3-5 days',
                description: 'Global standard shipping.',
                is_active: 1
            }
        ];

        console.log('Seeding Carriers...');
        for (const carrier of carriers) {
            await connection.execute(`
                INSERT INTO carriers (name, code, logo, delivery_time, description, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    code = VALUES(code),
                    delivery_time = VALUES(delivery_time),
                description = VALUES(description),
                    logo = VALUES(logo)
            `, [carrier.name, carrier.code, carrier.logo, carrier.delivery_time, carrier.description, carrier.is_active]);
        }

        // Seeding Attributes and Values
        console.log('Seeding Attributes...');
        const attributes = [
            {
                name: 'Weight',
                type: 'select',
                values: ['125g', '250g', '500g', '1kg']
            },
            {
                name: 'Roast Level',
                type: 'select',
                values: ['Light', 'Medium', 'Medium-Dark', 'Dark']
            },
            {
                name: 'Grind Type',
                type: 'select',
                values: ['Whole Bean', 'Fine (Espresso)', 'Medium (Drip)', 'Coarse (French Press)', 'Turkish']
            },
            {
                name: 'Packaging',
                type: 'select',
                values: ['Glass Jar', 'Premium Box', 'Vacuum Sealed Bag']
            },
            {
                name: 'Origin',
                type: 'text',
                values: ['Dawan', 'Haraz', 'Sana\'a', 'Socotra']
            },
            {
                name: 'Size',
                type: 'select',
                values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size']
            },
            {
                name: 'Shoe Size (EU)',
                type: 'select',
                values: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
            },
            {
                name: 'Color',
                type: 'color',
                values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Beige', 'Brown', 'Navy', 'Gold', 'Silver', 'Grey']
            },
            {
                name: 'Material',
                type: 'text',
                values: ['Cotton', 'Wool', 'Silk', 'Polyester', 'Leather', 'Linen', 'Velvet']
            },
            {
                name: 'Gender',
                type: 'select',
                values: ['Men', 'Women', 'Unisex', 'Kids']
            },
            {
                name: 'Season',
                type: 'select',
                values: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season']
            }
        ];

        for (const attr of attributes) {
            // Insert Attribute
            const [attrResult] = await connection.execute<ResultSetHeader>(`
                INSERT INTO attributes (name, type) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE name=name
            `, [attr.name, attr.type]); // Simple ignore if exists logic via ON DUPLICATE or select first

            // Get Attribute ID (either inserted or existing)
            let attributeId = attrResult.insertId;
            if (attributeId === 0) {
                const [existingAttr] = await connection.execute<RowDataPacket[]>('SELECT id FROM attributes WHERE name = ?', [attr.name]);
                if (existingAttr.length > 0) attributeId = existingAttr[0].id;
            }

            if (attributeId) {
                for (const val of attr.values) {
                    await connection.execute(`
                        INSERT INTO attribute_values (attribute_id, value)
                        VALUES (?, ?)
                        ON DUPLICATE KEY UPDATE value=value
                    `, [attributeId, val]);
                }
            }
        }

        // Seeding Products (with variants/attributes logic conceptualized for later)
        console.log('Seeding Zones...');
        const zones = [
            {
                name: 'France Metropolitaine',
                countries: JSON.stringify(['FR', 'MC', 'AD'])
            },
            {
                name: 'France Outre-mer (DOM-TOM)',
                countries: JSON.stringify(['GP', 'MQ', 'RE', 'GF', 'YT', 'PM', 'BL', 'MF', 'WF', 'PF', 'NC'])
            },
            {
                name: 'Europe',
                countries: JSON.stringify(['DE', 'BE', 'NL', 'LU', 'IT', 'ES', 'PT', 'AT', 'IE', 'SE', 'DK', 'FI', 'GR', 'PL', 'CZ', 'HU'])
            },
            {
                name: 'International (World)',
                countries: JSON.stringify([
                    'US', 'CA', 'GB', 'CH', // North America + Non-EU
                    'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'YE', // Gulf & Yemen
                    'AU', 'JP', 'KR', 'SG', 'CN', // Asia Pacific
                    'TR', 'MA', 'DZ', 'TN', 'EG'  // MENA
                ])
            }
        ];

        const zoneIds: Record<string, number> = {};

        for (const zone of zones) {
            const [rows] = await connection.execute<RowDataPacket[]>('SELECT id FROM shipping_zones WHERE name = ?', [zone.name]);
            let zoneId;
            if (rows.length === 0) {
                const [res] = await connection.execute<ResultSetHeader>('INSERT INTO shipping_zones (name, countries, is_active) VALUES (?, ?, 1)', [zone.name, zone.countries]);
                zoneId = res.insertId;
            } else {
                zoneId = rows[0].id;
                await connection.execute('UPDATE shipping_zones SET countries = ? WHERE id = ?', [zone.countries, zoneId]);
            }
            zoneIds[zone.name] = zoneId;
        }

        // Get Carrier IDs
        async function getCarrierId(code: string): Promise<number> {
            const [rows] = await connection.execute<RowDataPacket[]>('SELECT id FROM carriers WHERE code = ?', [code]);
            return rows[0]?.id;
        }

        const dhlId = await getCarrierId('dhl');
        const colissimoId = await getCarrierId('colissimo');
        const mondialRelayId = await getCarrierId('mondial_relay');
        const fedexId = await getCarrierId('fedex');
        const upsId = await getCarrierId('ups');

        // Shipping Rates (Prices)
        console.log('Seeding Rates...');
        const rates = [
            // France Metropolitaine - Colissimo (Home)
            { zoneId: zoneIds['France Metropolitaine'], carrierId: colissimoId, min: 0, max: 250, price: 4.95 },
            { zoneId: zoneIds['France Metropolitaine'], carrierId: colissimoId, min: 250, max: 1000, price: 7.95 },
            { zoneId: zoneIds['France Metropolitaine'], carrierId: colissimoId, min: 1000, max: 5000, price: 12.95 },

            // France Metropolitaine - Mondial Relay (Point Relais - Cheaper)
            { zoneId: zoneIds['France Metropolitaine'], carrierId: mondialRelayId, min: 0, max: 1000, price: 3.90 },
            { zoneId: zoneIds['France Metropolitaine'], carrierId: mondialRelayId, min: 1000, max: 3000, price: 5.90 },

            // France Outre-mer - Colissimo (Higher rates)
            { zoneId: zoneIds['France Outre-mer (DOM-TOM)'], carrierId: colissimoId, min: 0, max: 500, price: 11.90 },
            { zoneId: zoneIds['France Outre-mer (DOM-TOM)'], carrierId: colissimoId, min: 500, max: 1000, price: 17.90 },
            { zoneId: zoneIds['France Outre-mer (DOM-TOM)'], carrierId: colissimoId, min: 1000, max: 3000, price: 29.90 },

            // Europe - DHL (Fast)
            { zoneId: zoneIds['Europe'], carrierId: dhlId, min: 0, max: 1000, price: 14.90 },
            { zoneId: zoneIds['Europe'], carrierId: dhlId, min: 1000, max: 3000, price: 19.90 },

            // Europe - Mondial Relay (Economy)
            { zoneId: zoneIds['Europe'], carrierId: mondialRelayId, min: 0, max: 2000, price: 9.90 },

            // Europe - UPS (Standard)
            { zoneId: zoneIds['Europe'], carrierId: upsId, min: 0, max: 1000, price: 12.90 },
            { zoneId: zoneIds['Europe'], carrierId: upsId, min: 1000, max: 3000, price: 16.90 },
            { zoneId: zoneIds['Europe'], carrierId: upsId, min: 3000, max: 5000, price: 24.90 },

            // Europe - FedEx (Priority)
            { zoneId: zoneIds['Europe'], carrierId: fedexId, min: 0, max: 1000, price: 15.90 },
            { zoneId: zoneIds['Europe'], carrierId: fedexId, min: 1000, max: 3000, price: 22.90 },

            // International (World) - DHL
            { zoneId: zoneIds['International (World)'], carrierId: dhlId, min: 0, max: 1000, price: 29.90 },
            { zoneId: zoneIds['International (World)'], carrierId: dhlId, min: 1000, max: 3000, price: 49.90 },
            { zoneId: zoneIds['International (World)'], carrierId: dhlId, min: 3000, max: 5000, price: 69.90 },

            // International (World) - FedEx
            { zoneId: zoneIds['International (World)'], carrierId: fedexId, min: 0, max: 1000, price: 32.90 },
            { zoneId: zoneIds['International (World)'], carrierId: fedexId, min: 1000, max: 3000, price: 55.90 },

            // International (World) - UPS
            { zoneId: zoneIds['International (World)'], carrierId: upsId, min: 0, max: 1000, price: 28.90 },
            { zoneId: zoneIds['International (World)'], carrierId: upsId, min: 1000, max: 3000, price: 45.90 }
        ];

        // Clear old rates to prevent duplicates with different IDs
        await connection.execute('TRUNCATE TABLE shipping_rates');

        for (const rate of rates) {
            if (!rate.zoneId || !rate.carrierId) continue;
            await connection.execute(`
                INSERT INTO shipping_rates (zone_id, carrier_id, min_weight, max_weight, price)
                VALUES (?, ?, ?, ?, ?)
            `, [rate.zoneId, rate.carrierId, rate.min, rate.max, rate.price]);
        }


        // --- NEW SEEDING LOGIC START ---

        // Admins
        console.log('Seeding Admins...');
        const adminEmail = 'admin@yemkaf.com';
        const [existingAdmins] = await connection.execute<RowDataPacket[]>('SELECT id FROM admins WHERE email = ?', [adminEmail]);

        if (existingAdmins.length === 0) {
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            await connection.execute(`
                INSERT INTO admins (email, password_hash, name, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, [adminEmail, hashedPassword, 'Super Admin', 'SUPER_ADMIN']);
            console.log(`Created admin: ${adminEmail}`);
        } else {
            console.log(`Admin ${adminEmail} already exists. Skipping.`);
        }

        // Store Config
        console.log('Seeding Store Config...');

        // Fetch product IDs for config
        const [allProducts] = await connection.execute<RowDataPacket[]>('SELECT id, slug FROM products');
        const getProdId = (slug: string) => allProducts.find(p => p.slug === slug)?.id;

        // ensure we have IDs, fallback to first available if specific slug not found
        const p1 = getProdId('royal-sidr-honey') || allProducts[0]?.id;
        const p2 = getProdId('ibini-coffee') || allProducts[1]?.id || p1;
        const p3 = getProdId('honey-gift-box') || allProducts[2]?.id || p1;
        const p4 = getProdId('sumur-honey') || allProducts[0]?.id;
        const p5 = getProdId('hawaij-spice-mix') || allProducts[0]?.id;

        const configs = [
            { key: 'site_name', value: 'Yemeni Market (Yem Kaf)', group: 'general' },
            { key: 'site_description', value: 'Authentic Yemeni Products - Honey, Coffee, & More', group: 'general' },
            { key: 'contact_email', value: 'support@yemkaf.com', group: 'contact' },
            { key: 'currency', value: 'EUR', group: 'localization' },
            {
                key: 'homepage_promo_category_ids',
                value: JSON.stringify([honeyId, coffeeId, giftsId].filter(id => id !== undefined)),
                group: 'homepage'
            },
            // NEW HOMEPAGE KEYS
            {
                key: 'homepage_hero_products',
                value: JSON.stringify([p1, p3].filter(Boolean)),
                group: 'homepage'
            },
            {
                key: 'homepage_featured_categories',
                value: JSON.stringify([honeyId, coffeeId, giftsId, spicesId].filter(id => id !== undefined)),
                group: 'homepage'
            },
            {
                key: 'homepage_flash_sale_product_ids',
                value: JSON.stringify([p5].filter(Boolean)),
                group: 'homepage'
            },
            {
                key: 'homepage_best_sellers_ids',
                value: JSON.stringify([p1, p2, p3, p4].filter(Boolean)),
                group: 'homepage'
            },
            {
                key: 'homepage_special_offers_ids',
                value: JSON.stringify([p4, p2].filter(Boolean)),
                group: 'homepage'
            },
            {
                key: 'homepage_flash_sale_end_date',
                value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
                group: 'homepage'
            },
            {
                key: 'homepage_flash_sale_ends_soon_text',
                value: 'Offer ends soon!',
                group: 'homepage'
            },
            {
                key: 'homepage_promo_grid',
                value: JSON.stringify([
                    { title: "New Harvest", sub: "Fresh from Do'an", image: "/images/honey-jar.jpg", link: "/shop/honey" },
                    { title: "Ramadan Essentials", sub: "Prepare for the holy month", image: "/images/products/encensoir.jpg", link: "/shop/gifts" },
                    { title: "Spices of Yemen", sub: "Authentic flavors", image: "/images/products/henne-250.jpg", link: "/shop/spices" }
                ]),
                group: 'homepage'
            },
            {
                key: 'menu_main',
                value: JSON.stringify([
                    { label: "nav.home", href: "/" },
                    { label: "nav.shop", href: "/shop" },
                    { label: "nav.ourStory", "href": "/our-story" },
                    { label: "nav.farms", "href": "/the-farms" },
                    { label: "nav.contact", "href": "/contact" }
                ]),
                group: 'menus'
            },
            // Header & Marquee Settings
            { key: 'logo_url', value: '/images/logo.png', group: 'header' },
            { key: 'show_marquee', value: 'true', group: 'header' },
            { key: 'marquee_text_en', value: 'Authentic Yemeni Treasures • Free Shipping over $150 • Premium Sidr Honey', group: 'header' },
            { key: 'marquee_text_fr', value: 'Trésors Yéménites Authentiques • Livraison Gratuite dès 150€ • Miel Sidr Premium', group: 'header' },
            { key: 'marquee_text_ar', value: 'كنوز يمنية أصيلة • شحن مجاني للطلبات فوق 150 دولار • عسل السدر الفاخر', group: 'header' },
            { key: 'header_sticky', value: 'true', group: 'header' },
            { key: 'header_layout', value: 'logo-left', group: 'header' },
            { key: 'logo_width_desktop', value: '48', group: 'header' }
        ];

        for (const config of configs) {
            await connection.execute(`
                INSERT INTO store_config (\`key\`, value, \`group\`, updated_at)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    value = VALUES(value),
                    \`group\` = VALUES(\`group\`),
                    updated_at = NOW()
            `, [config.key, config.value, config.group]);
        }

        // Cart Rules (Discounts)
        console.log('Seeding Cart Rules...');
        const discounts = [
            {
                name: 'Welcome Discount',
                code: 'WELCOME10',
                description: '10% off for new customers',
                reduction_percent: 10.00,
                is_active: 1
            }
        ];

        for (const discount of discounts) {
            await connection.execute(`
                INSERT INTO cart_rules (name, code, description, reduction_percent, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    description = VALUES(description),
                    reduction_percent = VALUES(reduction_percent),
                    is_active = VALUES(is_active)
            `, [discount.name, discount.code, discount.description, discount.reduction_percent, discount.is_active]);
        }

        // Customers (for Reviews)
        console.log('Seeding Customers...');
        const customers = [
            { email: 'sarah.m@example.com', name: 'Sarah M.', firstName: 'Sarah', lastName: 'M.' },
            { email: 'ahmed.k@example.com', name: 'Ahmed K.', firstName: 'Ahmed', lastName: 'K.' },
            { email: 'sophie.l@example.com', name: 'Sophie L.', firstName: 'Sophie', lastName: 'L.' },
            { email: 'david.b@example.com', name: 'David B.', firstName: 'David', lastName: 'B.' },
            { email: 'fatima.r@example.com', name: 'Fatima R.', firstName: 'Fatima', lastName: 'R.' }
        ];

        const customerIds: number[] = [];

        for (const cust of customers) {
            const [existing] = await connection.execute<RowDataPacket[]>('SELECT id FROM customers WHERE email = ?', [cust.email]);
            if (existing.length > 0) {
                customerIds.push(existing[0].id);
            } else {
                const [res] = await connection.execute<ResultSetHeader>(`
                    INSERT INTO customers (email, first_name, last_name, created_at)
                    VALUES (?, ?, ?, NOW())
                `, [cust.email, cust.firstName, cust.lastName]);
                customerIds.push(res.insertId);
            }
        }

        // Reviews
        console.log('Seeding Reviews...');
        // Randomly assign reviews to products (Honey, Coffee, Gifts)

        // Note: Ideally we look up actual product IDs. 
        // Let's get a few product IDs first.
        const [prodRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM products LIMIT 5');
        const productIds = prodRows.map(r => r.id);

        if (productIds.length > 0 && customerIds.length > 0) {
            const reviews = [
                {
                    rating: 5,
                    comment: "Absolutely the best honey I've ever tasted. The packaging was luxurious!",
                    customerId: customerIds[0],
                    productId: productIds[0]
                },
                {
                    rating: 5,
                    comment: "The aroma of this coffee fills the entire house. True Mocha quality.",
                    customerId: customerIds[1],
                    productId: productIds[1] || productIds[0]
                },
                {
                    rating: 4,
                    comment: "Fast shipping to Paris. The gift box is beautiful.",
                    customerId: customerIds[2],
                    productId: productIds[2] || productIds[0]
                },
                {
                    rating: 5,
                    comment: "Authentic taste, reminds me of home. Will order again.",
                    customerId: customerIds[3],
                    productId: productIds[0]
                },
                {
                    rating: 5,
                    comment: "Excellent customer service and premium quality.",
                    customerId: customerIds[4],
                    productId: productIds[1] || productIds[0]
                }
            ];

            for (const review of reviews) {
                await connection.execute(`
                    INSERT INTO reviews (rating, comment, customer_id, product_id, is_active, is_verified, created_at)
                    VALUES (?, ?, ?, ?, 1, 1, NOW())
                `, [review.rating, review.comment, review.customerId, review.productId]);
            }
        }

        // Blog Posts
        console.log('Seeding Blog Posts...');
        const blogPosts = [
            {
                title: 'The Ancient History of Sidr Honey',
                slug: 'ancient-history-sidr-honey',
                excerpt: 'Discover why Sidr honey has been treasured for centuries as liquid gold.',
                content: 'Sidr honey comes from the Lote tree...',
                image: '/images/honey-jar.jpg',
                category: 'Education'
            },
            {
                title: 'Brewing the Perfect Yemeni Coffee',
                slug: 'brewing-perfect-yemeni-coffee',
                excerpt: 'A step-by-step guide to making traditional Qahwa.',
                content: 'Yemeni coffee is distinct...',
                image: '/images/coffee-beans.jpg',
                category: 'Guides'
            },
            {
                title: 'Ramadan Gift Guide 2026',
                slug: 'ramadan-gift-guide-2026',
                excerpt: 'Curated selection of gifts for the holy month.',
                content: 'Find the perfect gift...',
                image: '/images/products/encensoir.jpg',
                category: 'Lifestyle'
            }
        ];

        for (const post of blogPosts) {
            await connection.execute(`
                INSERT INTO blog_posts (title, slug, excerpt, content, image, category, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED', NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    excerpt = VALUES(excerpt),
                    image = VALUES(image),
                    category = VALUES(category),
                    status = 'PUBLISHED'
            `, [post.title, post.slug, post.excerpt, post.content, post.image, post.category]);
        }

        // CMS Pages (Header Links)
        console.log('Seeding CMS Pages...');
        const pages = [
            {
                title: 'Our Story',
                slug: 'our-story',
                content: '<h1>Our Story</h1><p>Yemeni Market was founded with a single purpose: to bridge the gap between the ancient, untouched valleys of Yemen and the modern connoisseur.</p>',
                structured_content: JSON.stringify({
                    hero: {
                        title: "Roots of Arabia",
                        subtitle: "We believe in the power of origin. Our products are not just commodities; they are stories of heritage, resilience, and uncompromised quality.",
                        image: "/images/yemen-landscape.jpg"
                    },
                    sections: [
                        {
                            type: 'image-text',
                            title: 'The Legacy',
                            content: "For centuries, the valleys of Yemen have produced the world's most prized honey and coffee. We work directly with generational farmers who have tended these lands for millennia.",
                            image: "/images/honey-jar.jpg",
                            imagePosition: 'left'
                        },
                        {
                            type: 'grid',
                            title: 'From Source to You',
                            content: "Our process is simple: purity above all.",
                            items: [
                                { title: "Harvest", content: "Hand-picked at peak season." },
                                { title: "Verify", content: "Lab-tested for 100% purity." },
                                { title: "Deliver", content: "Directly to your doorstep." }
                            ]
                        }
                    ],
                    conclusion: {
                        title: "Uncompromising Quality",
                        content: "We promise to bring you only the authentic, pure, and untouched treasures of Yemen."
                    }
                }),
                showInHeader: true,
                showInFooter: true,
                displayOrder: 1
            },
            {
                title: 'Mentions Légales',
                slug: 'mentions-legales',
                content: `
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4 italic">1. Édition du site</h2>
                        <p>En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet <strong>yemenimarket.fr</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :</p>
                        <ul class="list-none pl-0 space-y-2">
                            <li><strong>Propriétaire du site :</strong> Yemen Kaf</li>
                            <li><strong>Contact :</strong> support@yemenkaf.com | +33 6 66 33 68 60</li>
                            <li><strong>Adresse :</strong> France</li>
                        </ul>
                    </section>
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4 italic">2. Hébergement</h2>
                        <p>Le Site est hébergé par <strong>Hostinger International Ltd.</strong>, dont le siège social est situé 61 Lordou Vironos Street, 6023 Larnaca, Chypre. (Contact : https://www.hostinger.fr/contact).</p>
                    </section>
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4 italic">3. Propriété intellectuelle</h2>
                        <p>Yemen Kaf est propriétaire des droits de propriété intellectuelle ou détient les droits d’usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, icônes, sons, logiciels.</p>
                    </section>
                `,
                showInHeader: false,
                showInFooter: true,
                displayOrder: 10,
                structured_content: null
            },
            {
                title: 'Conditions Générales de Vente',
                slug: 'cgv',
                content: `
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">1. Objet</h2>
                        <p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Yemen Kaf et toute personne effectuant un achat sur le site yemenimarket.fr.</p>
                    </section>
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">2. Produits</h2>
                        <p>Yemen Kaf propose à la vente des produits yéménites authentiques (miel, café, encens, etc.). Les caractéristiques essentielles des produits sont présentées sur le site.</p>
                    </section>
                `,
                showInHeader: false,
                showInFooter: true,
                displayOrder: 11,
                structured_content: null
            },
            {
                title: 'Privacy Policy',
                slug: 'privacy',
                content: `
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">1. Introduction</h2>
                        <p>We respect your privacy and are committed to protecting your personal data in accordance with GDPR. This policy explains how we collect, use, and safeguard your information.</p>
                    </section>
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">2. Data We Collect</h2>
                        <p>We collect identity data, contact data, transaction data, and technical data to process your orders and improve our services.</p>
                    </section>
                `,
                showInHeader: false,
                showInFooter: true,
                displayOrder: 12,
                structured_content: null
            },
            {
                title: 'Terms of Service',
                slug: 'terms',
                content: `
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">1. Introduction</h2>
                        <p>Welcome to Yemen Kaf. By accessing our website and purchasing our products, you agree to be bound by these Terms of Service.</p>
                    </section>
                `,
                showInHeader: false,
                showInFooter: true,
                displayOrder: 13,
                structured_content: null
            },
            {
                title: 'Shipping Policy',
                slug: 'shipping-policy',
                content: `
                    <section>
                        <h2 class="text-2xl font-serif text-black mt-8 mb-4">Shipping Methods</h2>
                        <ul class="list-disc pl-6">
                            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
                            <li><strong>Express Shipping:</strong> 2-3 business days</li>
                        </ul>
                    </section>
                `,
                showInHeader: false,
                showInFooter: true,
                displayOrder: 14,
                structured_content: null
            }
        ];

        for (const page of pages) {
            await connection.execute(`
                INSERT INTO cms_pages (title, slug, content, structured_content, show_in_header, show_in_footer, display_order, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    content = VALUES(content),
                    structured_content = VALUES(structured_content),
                    show_in_header = VALUES(show_in_header),
                    show_in_footer = VALUES(show_in_footer),
                    display_order = VALUES(display_order),
                    updated_at = NOW()
            `, [page.title, page.slug, page.content, page.structured_content, page.showInHeader, page.showInFooter, page.displayOrder]);
        }

        console.log('Seeding completed successfully.');

    } catch (error: unknown) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
