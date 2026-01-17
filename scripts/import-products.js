
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importProducts() {
    const filePath = path.join(__dirname, '../../request_sql_1.csv');

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`📂 Reading CSV file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');

    // Split by new line, handling potential carriage returns
    const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== '');

    // Parse Headers (Line 1)
    // Headers: id_product;reference;id_shop_default;price_tax_excluded;...
    const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
    console.log('📊 Headers identified:', headers);

    let successCount = 0;
    let failCount = 0;

    // Process Rows (Skip header)
    for (let i = 1; i < lines.length; i++) {
        const rowRaw = lines[i];

        // Handle split carefully if values contain semicolons (simple split for now as data looks clean)
        // Removing quotes from values
        const cols = rowRaw.split(';').map(c => c.replace(/^"|"$/g, '').trim());

        if (cols.length < 5) continue; // Skip empty/malformed rows

        // Map columns to variables based on index
        const data = {};
        headers.forEach((header, index) => {
            data[header] = cols[index];
        });

        try {
            // 1. Resolve Category
            const categoryName = data['category'] || 'Uncategorized';
            const categorySlug = categoryName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            let category = await prisma.category.findUnique({
                where: { slug: categorySlug }
            });

            if (!category) {
                category = await prisma.category.create({
                    data: {
                        name: categoryName,
                        slug: categorySlug,
                        isActive: true
                    }
                });
                console.log(`   └─ Created Category: ${categoryName}`);
            }

            // 2. Prepare Product Data
            const name = data['name'];
            let slug = data['link_rewrite'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Ensure slug uniqueness logic could be added here, but Prisma will throw if duplicate
            // Simple duplicate slug prevention: append ID if conflict (handled in catch block or pre-check)

            const reference = data['reference'] || `IMP-${data['id_product']}`; // Fallback SKU
            const price = parseFloat(data['price_tax_excluded'] || '0');
            const stock = parseInt(data['quantity'] || '0');
            const isActive = data['active'] === '1';
            const ecotax = parseFloat(data['ecotax_tax_excluded'] || '0');

            // Upsert Product (Update if exists by Reference/SKU, otherwise Create)
            // Since `reference` is unique in our new schema, we use it for lookup
            // Note: Data shows some empty references. We generates one if empty.

            // Check if product exists by slug first to avoid unique constraint error
            const existingProduct = await prisma.product.findUnique({
                where: { slug: slug }
            });

            if (existingProduct) {
                // Update
                await prisma.product.update({
                    where: { id: existingProduct.id },
                    data: {
                        name,
                        price,
                        stockQuantity: stock,
                        categoryId: category.id,
                        isActive,
                        reference,
                        ecotax
                    }
                });
                console.log(`✅ Updated: ${name}`);
            } else {
                // Create
                await prisma.product.create({
                    data: {
                        name,
                        slug,
                        sku: reference, // Mapping reference to SKU as primary identifier
                        reference,
                        price,
                        stockQuantity: stock,
                        categoryId: category.id,
                        isActive,
                        ecotax,
                        images: data['id_image'] ? `legacy_image_${data['id_image']}.jpg` : null // Placeholder for image logic
                    }
                });
                console.log(`✨ Created: ${name}`);
            }

            successCount++;

        } catch (e) {
            console.error(`❌ Failed Row ${i + 1} (${cols[7] || 'Unknown'}):`, e.message);
            failCount++;
        }
    }

    console.log(`\n🎉 Import Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed:  ${failCount}`);
}

importProducts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
