const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    console.log('Starting seed (aligned with Navbar)...');

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
        async function getCatId(slug) {
            const [rows] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [slug]);
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

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
