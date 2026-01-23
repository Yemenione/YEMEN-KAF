import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Data Migration...');

    const categoryFile = 'c:/Users/utilisateur/Desktop/YEM KAF/category_2026-01-15_165028.csv';
    const productFile = 'c:/Users/utilisateur/Desktop/YEM KAF/request_sql_1.csv';

    // 1. Clear existing data
    console.log('🗑️  Clearing existing data...');
    try { await prisma.review.deleteMany({}); } catch { }
    try { await prisma.cartItem.deleteMany({}); } catch { }
    try { await prisma.orderItem.deleteMany({}); } catch { }
    try { await prisma.wishlist.deleteMany({}); } catch { }
    try { await prisma.product.deleteMany({}); } catch { }
    try { await prisma.category.deleteMany({}); } catch { }
    console.log('✅ Database cleared.');

    // 2. Parse Categories
    console.log('📁 Importing Categories...');
    // Using utf-8 specifically to fix the mojibake encoding issues
    const catData = fs.readFileSync(categoryFile, 'utf-8');
    const catLines = catData.split('\n').filter(line => line.trim() !== '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: any[] = [];

    // Skip header
    for (let i = 1; i < catLines.length; i++) {
        const parts = catLines[i].split(';').map(p => p.replace(/"/g, '').trim());
        if (parts.length < 2) continue;

        const [id, name, description] = parts;
        const slug = name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');

        try {
            const category = await prisma.category.create({
                data: {
                    name,
                    slug: `${slug}-${id}`, // Ensure unique
                    description: description || name,
                }
            });
            categories.push({ oldName: name, newCategory: category });
            console.log(`   - Imported Category: ${name}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(`   ❌ Failed to import category ${name}:`, err.message);
        }
    }

    // 3. Parse Products
    console.log('📦 Importing Products...');
    const prodData = fs.readFileSync(productFile, 'utf-8');
    const prodLines = prodData.split('\n').filter(line => line.trim() !== '');

    // Skip header
    for (let i = 1; i < prodLines.length; i++) {
        const parts = prodLines[i].split(';').map(p => p.replace(/"/g, '').trim());
        if (parts.length < 8) continue;

        const id = parts[0];
        const ref = parts[1];
        const price = parseFloat(parts[3]) || 0;
        const name = parts[7];
        const slugAttr = parts[8];
        const catName = parts[9];
        const quantity = parseInt(parts[13]) || 0;

        const categoryMatch = categories.find(c => c.oldName === catName);

        const slug = (slugAttr || name).toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');

        try {
            await prisma.product.create({
                data: {
                    name,
                    slug: `${slug}-${id}`,
                    price: price * 1.2, // Rough estimate
                    description: name,
                    sku: ref || `YEM-${id}`,
                    stockQuantity: quantity,
                    categoryId: categoryMatch ? categoryMatch.newCategory.id : null,
                    isActive: true,
                    isFeatured: false,
                }
            });
            console.log(`   - Imported Product: ${name}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(`   ❌ Failed to import product ${name}:`, err.message);
        }
    }

    console.log('🏁 Migration finished successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
