import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import 'dotenv/config';

async function main() {
    console.log('🌟 Starting Rich Content Seed...');

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
        // ============================================
        // 1. BRANDS - Yemeni & International
        // ============================================
        console.log('📦 Adding Premium Brands...');
        const brands = [
            {
                name: 'Al-Malaki',
                slug: 'al-malaki',
                description: 'Royal Yemeni Honey - The King of Honeys',
                logo: '/uploads/brands/al-malaki.png',
                is_active: 1
            },
            {
                name: 'Haraz Heritage',
                slug: 'haraz-heritage',
                description: 'Premium Coffee from Haraz Mountains',
                logo: '/uploads/brands/haraz-heritage.png',
                is_active: 1
            },
            {
                name: 'Sana\'a Spices',
                slug: 'sanaa-spices',
                description: 'Traditional Yemeni Spice Blends',
                logo: '/uploads/brands/sanaa-spices.png',
                is_active: 1
            },
            {
                name: 'Yemen Luxe',
                slug: 'yemen-luxe',
                description: 'Luxury Gift Collections',
                logo: '/uploads/brands/yemen-luxe.png',
                is_active: 1
            },
            {
                name: 'Bab Al-Yemen',
                slug: 'bab-al-yemen',
                description: 'Authentic Yemeni Crafts & Pottery',
                logo: '/uploads/brands/bab-al-yemen.png',
                is_active: 1
            }
        ];

        const brandIds: Record<string, number> = {};
        for (const brand of brands) {
            const [result] = await connection.execute<ResultSetHeader>(`
                INSERT INTO brands (name, slug, logo, description, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    description = VALUES(description),
                    logo = VALUES(logo),
                    updated_at = NOW()
            `, [brand.name, brand.slug, brand.logo, brand.description, brand.is_active]);

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM brands WHERE slug = ?',
                [brand.slug]
            );
            brandIds[brand.slug] = rows[0].id;
        }

        // ============================================
        // 2. ATTRIBUTES - Size, Color, Weight, etc.
        // ============================================
        console.log('🎨 Adding Product Attributes...');
        const attributes = [
            { name: 'Size', type: 'select' },
            { name: 'Color', type: 'color' },
            { name: 'Weight', type: 'select' },
            { name: 'Material', type: 'select' },
            { name: 'Roast Level', type: 'select' }
        ];

        const attributeIds: Record<string, number> = {};
        for (const attr of attributes) {
            const [result] = await connection.execute<ResultSetHeader>(`
                INSERT INTO attributes (name, type)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
            `, [attr.name, attr.type]);

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM attributes WHERE name = ?',
                [attr.name]
            );
            attributeIds[attr.name] = rows[0].id;
        }

        // ============================================
        // 3. ATTRIBUTE VALUES
        // ============================================
        console.log('✨ Adding Attribute Values...');
        const attributeValues = [
            // Sizes
            { attribute_name: 'Size', value: 'Small (250g)', display_order: 1 },
            { attribute_name: 'Size', value: 'Medium (500g)', display_order: 2 },
            { attribute_name: 'Size', value: 'Large (1kg)', display_order: 3 },
            { attribute_name: 'Size', value: 'XL (2kg)', display_order: 4 },

            // Colors
            { attribute_name: 'Color', value: 'Golden', display_order: 1 },
            { attribute_name: 'Color', value: 'Dark Amber', display_order: 2 },
            { attribute_name: 'Color', value: 'Light Brown', display_order: 3 },
            { attribute_name: 'Color', value: 'Natural', display_order: 4 },

            // Weights
            { attribute_name: 'Weight', value: '250g', display_order: 1 },
            { attribute_name: 'Weight', value: '500g', display_order: 2 },
            { attribute_name: 'Weight', value: '1kg', display_order: 3 },
            { attribute_name: 'Weight', value: '2kg', display_order: 4 },

            // Materials
            { attribute_name: 'Material', value: 'Ceramic', display_order: 1 },
            { attribute_name: 'Material', value: 'Clay', display_order: 2 },
            { attribute_name: 'Material', value: 'Glass', display_order: 3 },
            { attribute_name: 'Material', value: 'Wood', display_order: 4 },

            // Roast Levels
            { attribute_name: 'Roast Level', value: 'Light Roast', display_order: 1 },
            { attribute_name: 'Roast Level', value: 'Medium Roast', display_order: 2 },
            { attribute_name: 'Roast Level', value: 'Dark Roast', display_order: 3 }
        ];

        const attributeValueIds: Record<string, number> = {};
        for (const av of attributeValues) {
            const attrId = attributeIds[av.attribute_name];
            const [result] = await connection.execute<ResultSetHeader>(`
                INSERT INTO attribute_values (attribute_id, value)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE value = VALUES(value)
            `, [attrId, av.value]);

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ?',
                [attrId, av.value]
            );
            attributeValueIds[`${av.attribute_name}:${av.value}`] = rows[0].id;
        }

        // ============================================
        // 4. GET CATEGORY IDS
        // ============================================
        const [honeyRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', ['honey']);
        const [coffeeRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', ['coffee']);
        const [giftsRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', ['gifts']);
        const [spicesRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', ['spices']);

        const honeyCatId = honeyRows[0]?.id || 1;
        const coffeeCatId = coffeeRows[0]?.id || 2;
        const giftsCatId = giftsRows[0]?.id || 3;
        const spicesCatId = spicesRows[0]?.id || 5;

        // ============================================
        // 5. RICH PRODUCTS WITH VARIANTS
        // ============================================
        console.log('🍯 Adding Premium Products...');

        const products = [
            // HONEY PRODUCTS
            {
                name: 'Royal Sidr Honey - Premium Grade',
                slug: 'royal-sidr-honey-premium',
                description: 'The finest Sidr honey from the ancient Sidr trees of Hadramaut. Known for its healing properties and rich flavor.',
                price: 89.99,
                compare_at_price: 119.99,
                category_id: honeyCatId,
                brand_id: brandIds['al-malaki'],
                images: JSON.stringify(['/images/products/sidr-honey-1.jpg', '/images/products/sidr-honey-2.jpg']),
                stock_quantity: 50,
                is_featured: 1,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', weight: '250g', price: 49.99, stock: 20, sku: 'SH-250' },
                    { size: 'Medium (500g)', weight: '500g', price: 89.99, stock: 15, sku: 'SH-500' },
                    { size: 'Large (1kg)', weight: '1kg', price: 159.99, stock: 10, sku: 'SH-1000' },
                    { size: 'XL (2kg)', weight: '2kg', price: 299.99, stock: 5, sku: 'SH-2000' }
                ]
            },
            {
                name: 'Sumur Honey - Mountain Wildflower',
                slug: 'sumur-honey-wildflower',
                description: 'Rare wildflower honey from the high mountains of Yemen. Rich in antioxidants and minerals.',
                price: 69.99,
                compare_at_price: 89.99,
                category_id: honeyCatId,
                brand_id: brandIds['al-malaki'],
                images: JSON.stringify(['/images/products/sumur-honey.jpg']),
                stock_quantity: 40,
                is_featured: 1,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', weight: '250g', price: 39.99, stock: 15, sku: 'SM-250' },
                    { size: 'Medium (500g)', weight: '500g', price: 69.99, stock: 15, sku: 'SM-500' },
                    { size: 'Large (1kg)', weight: '1kg', price: 129.99, stock: 10, sku: 'SM-1000' }
                ]
            },
            {
                name: 'Acacia Honey - Golden Nectar',
                slug: 'acacia-honey-golden',
                description: 'Light and delicate honey from Acacia flowers. Perfect for tea and desserts.',
                price: 45.99,
                category_id: honeyCatId,
                brand_id: brandIds['al-malaki'],
                images: JSON.stringify(['/images/products/acacia-honey.jpg']),
                stock_quantity: 60,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', weight: '250g', price: 25.99, stock: 25, sku: 'AC-250' },
                    { size: 'Medium (500g)', weight: '500g', price: 45.99, stock: 20, sku: 'AC-500' },
                    { size: 'Large (1kg)', weight: '1kg', price: 85.99, stock: 15, sku: 'AC-1000' }
                ]
            },

            // COFFEE PRODUCTS
            {
                name: 'Haraz Mocha Coffee - Single Origin',
                slug: 'haraz-mocha-coffee',
                description: 'Premium single-origin coffee from the Haraz mountains. Notes of chocolate and berries.',
                price: 34.99,
                compare_at_price: 44.99,
                category_id: coffeeCatId,
                brand_id: brandIds['haraz-heritage'],
                images: JSON.stringify(['/images/products/haraz-coffee-1.jpg', '/images/products/haraz-coffee-2.jpg']),
                stock_quantity: 100,
                is_featured: 1,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', roast: 'Light Roast', price: 19.99, stock: 30, sku: 'HC-250-L' },
                    { size: 'Small (250g)', roast: 'Medium Roast', price: 19.99, stock: 30, sku: 'HC-250-M' },
                    { size: 'Small (250g)', roast: 'Dark Roast', price: 19.99, stock: 30, sku: 'HC-250-D' },
                    { size: 'Medium (500g)', roast: 'Medium Roast', price: 34.99, stock: 20, sku: 'HC-500-M' },
                    { size: 'Large (1kg)', roast: 'Medium Roast', price: 64.99, stock: 10, sku: 'HC-1000-M' }
                ]
            },
            {
                name: 'Ibini Coffee - Estate Grown',
                slug: 'ibini-coffee-estate',
                description: 'Smooth and balanced coffee from the Ibini region. Perfect for espresso.',
                price: 29.99,
                category_id: coffeeCatId,
                brand_id: brandIds['haraz-heritage'],
                images: JSON.stringify(['/images/products/ibini-coffee.jpg']),
                stock_quantity: 80,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', roast: 'Medium Roast', price: 16.99, stock: 40, sku: 'IB-250-M' },
                    { size: 'Medium (500g)', roast: 'Medium Roast', price: 29.99, stock: 25, sku: 'IB-500-M' },
                    { size: 'Large (1kg)', roast: 'Dark Roast', price: 54.99, stock: 15, sku: 'IB-1000-D' }
                ]
            },

            // GIFT SETS
            {
                name: 'Luxury Honey & Coffee Gift Box',
                slug: 'luxury-gift-box',
                description: 'Premium gift set featuring our finest Sidr honey and Haraz coffee. Perfect for special occasions.',
                price: 129.99,
                compare_at_price: 159.99,
                category_id: giftsCatId,
                brand_id: brandIds['yemen-luxe'],
                images: JSON.stringify(['/images/products/gift-box-1.jpg', '/images/products/gift-box-2.jpg']),
                stock_quantity: 25,
                is_featured: 1,
                is_active: 1,
                variants: []
            },
            {
                name: 'Ramadan Special Gift Set',
                slug: 'ramadan-gift-set',
                description: 'Beautiful gift set with dates, honey, and traditional sweets. Perfect for Ramadan gifting.',
                price: 79.99,
                category_id: giftsCatId,
                brand_id: brandIds['yemen-luxe'],
                images: JSON.stringify(['/images/products/ramadan-gift.jpg']),
                stock_quantity: 40,
                is_featured: 1,
                is_active: 1,
                variants: []
            },

            // SPICES
            {
                name: 'Hawaij Spice Mix - Traditional Blend',
                slug: 'hawaij-spice-mix',
                description: 'Authentic Yemeni spice blend for coffee and cooking. A perfect balance of cardamom, ginger, and cinnamon.',
                price: 12.99,
                category_id: spicesCatId,
                brand_id: brandIds['sanaa-spices'],
                images: JSON.stringify(['/images/products/hawaij-spice.jpg']),
                stock_quantity: 100,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', weight: '250g', price: 12.99, stock: 50, sku: 'HW-250' },
                    { size: 'Medium (500g)', weight: '500g', price: 22.99, stock: 30, sku: 'HW-500' },
                    { size: 'Large (1kg)', weight: '1kg', price: 39.99, stock: 20, sku: 'HW-1000' }
                ]
            },
            {
                name: 'Saffron Threads - Premium Quality',
                slug: 'saffron-threads',
                description: 'Finest saffron threads for cooking and tea. Adds luxury to any dish.',
                price: 24.99,
                category_id: spicesCatId,
                brand_id: brandIds['sanaa-spices'],
                images: JSON.stringify(['/images/products/saffron.jpg']),
                stock_quantity: 50,
                is_active: 1,
                variants: [
                    { size: 'Small (250g)', weight: '250g', price: 24.99, stock: 30, sku: 'SF-250' },
                    { size: 'Medium (500g)', weight: '500g', price: 44.99, stock: 20, sku: 'SF-500' }
                ]
            }
        ];

        for (const product of products) {
            // Insert product
            const [productResult] = await connection.execute<ResultSetHeader>(`
                INSERT INTO products (
                    name, slug, description, price, compare_at_price, category_id, brand_id,
                    images, stock_quantity, is_featured, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    description = VALUES(description),
                    price = VALUES(price),
                    updated_at = NOW()
            `, [
                product.name,
                product.slug,
                product.description,
                product.price,
                product.compare_at_price || null,
                product.category_id,
                product.brand_id,
                product.images,
                product.stock_quantity,
                product.is_featured || 0,
                product.is_active
            ]);

            const [productRows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM products WHERE slug = ?',
                [product.slug]
            );
            const productId = productRows[0].id;

            // Insert variants if any
            if (product.variants && product.variants.length > 0) {
                for (const variant of product.variants) {
                    const variantName = variant.size || 'Default Variant';
                    const [variantResult] = await connection.execute<ResultSetHeader>(`
                        INSERT INTO product_variants (
                            product_id, name, sku, price, stock
                        ) VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            name = VALUES(name),
                            price = VALUES(price),
                            stock = VALUES(stock)
                    `, [productId, variantName, variant.sku, variant.price, variant.stock]);

                    // Get variant ID (either newly inserted or existing)
                    const [variantRows] = await connection.execute<RowDataPacket[]>(
                        'SELECT id FROM product_variants WHERE sku = ?',
                        [variant.sku]
                    );
                    const variantId = variantRows[0].id;

                    // Link size attribute
                    if ('size' in variant && variant.size) {
                        const sizeValueId = attributeValueIds[`Size:${variant.size}`];
                        if (sizeValueId) {
                            await connection.execute(`
                                INSERT INTO product_variant_values (variant_id, attribute_value_id)
                                VALUES (?, ?)
                            `, [variantId, sizeValueId]);
                        }
                    }

                    // Link weight attribute
                    if ('weight' in variant && variant.weight) {
                        const weightValueId = attributeValueIds[`Weight:${variant.weight}`];
                        if (weightValueId) {
                            await connection.execute(`
                                INSERT INTO product_variant_values (variant_id, attribute_value_id)
                                VALUES (?, ?)
                            `, [variantId, weightValueId]);
                        }
                    }

                    // Link roast level attribute
                    if ('roast' in variant && variant.roast) {
                        const roastValueId = attributeValueIds[`Roast Level:${variant.roast}`];
                        if (roastValueId) {
                            await connection.execute(`
                                INSERT INTO product_variant_values (variant_id, attribute_value_id)
                                VALUES (?, ?)
                            `, [variantId, roastValueId]);
                        }
                    }
                }
            }

            console.log(`✅ Added: ${product.name} with ${product.variants?.length || 0} variants`);
        }

        console.log('\n🎉 Rich Content Seed Complete!');
        console.log('📊 Summary:');
        console.log(`   - ${brands.length} Premium Brands`);
        console.log(`   - ${attributes.length} Attributes`);
        console.log(`   - ${attributeValues.length} Attribute Values`);
        console.log(`   - ${products.length} Products`);
        console.log(`   - ${products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)} Product Variants`);

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

main()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
