import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import 'dotenv/config';

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
                name: 'Yemeni Honey',
                slug: 'honey', // Was 'yemeni-honey'
                description: 'Authentic Sidr and Sumur honey from the mountains of Yemen.',
                image_url: '/images/honey-comb.jpg',
                is_active: 1,
                display_order: 1
            },
            {
                name: 'Yemeni Coffee',
                slug: 'coffee', // Was 'yemeni-coffee'
                description: 'World-renowned coffee beans.',
                image_url: '/images/coffee-beans.jpg',
                is_active: 1,
                display_order: 2
            },
            {
                name: 'Gifts & Sets',
                slug: 'gifts',
                description: 'Beautiful gift sets for loved ones.',
                image_url: '/images/products/encensoir.jpg', // Placeholder
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

        // Zones
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

        console.log('Seeding completed successfully.');

    } catch (error: unknown) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
