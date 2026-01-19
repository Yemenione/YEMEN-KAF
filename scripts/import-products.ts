import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importProducts() {
    // Assuming the script is run from project root, and CSV is in root
    const filePath = path.resolve(process.cwd(), 'request_sql_1.csv');

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        // Try looking in parent directory as fallback (original logic had ../../)
        process.exit(1);
    }

    console.log(`📂 Reading CSV file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');

    // Split by new line, handling potential carriage returns
    const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) {
        console.error('❌ CSV file is empty');
        return;
    }

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
        const data: Record<string, string> = {};
        headers.forEach((header, index) => {
            if (index < cols.length) {
                data[header] = cols[index];
            }
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
            if (!name) continue;

            const slug = data['link_rewrite'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const reference = data['reference'] || `IMP-${data['id_product'] || Math.random().toString(36).substr(2, 9)}`;
            const price = parseFloat(data['price_tax_excluded'] || '0');
            const stock = parseInt(data['quantity'] || '0');
            const isActive = data['active'] === '1';
            const ecotax = parseFloat(data['ecotax_tax_excluded'] || '0');

            // Upsert Product
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
                        sku: reference,
                        reference,
                        price,
                        stockQuantity: stock,
                        categoryId: category.id,
                        isActive,
                        ecotax,
                        images: data['id_image'] ? `legacy_image_${data['id_image']}.jpg` : null
                    }
                });
                console.log(`✨ Created: ${name}`);
            }

            successCount++;

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            console.error(`❌ Failed Row ${i + 1} (${cols[7] || 'Unknown'}):`, msg);
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
