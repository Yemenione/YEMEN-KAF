
import { prisma } from '@/lib/prisma'; // Assuming global prisma instance

export interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

export async function importProductsFromCSV(csvContent: string): Promise<ImportResult> {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return { success: 0, failed: 0, errors: ['Empty CSV File'] };

    // Parse Headers
    const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const rowRaw = lines[i];
        const cols = rowRaw.split(';').map(c => c.replace(/^"|"$/g, '').trim());

        if (cols.length < 5) continue;

        const data: Record<string, string> = {};
        headers.forEach((header, index) => {
            data[header] = cols[index] || '';
        });

        try {
            // Logic mirrored from scripts/import-products.js

            // 1. Resolve Category
            const categoryName = data['category'] || 'Uncategorized';
            const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
            if (!category) {
                category = await prisma.category.create({
                    data: { name: categoryName, slug: categorySlug, isActive: true }
                });
            }

            // 2. Prepare Product Data
            const name = data['name'];
            const slug = data['link_rewrite'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const reference = data['reference'] || `IMP-${data['id_product']}`;
            const price = parseFloat(data['price_tax_excluded'] || '0');
            const stock = parseInt(data['quantity'] || '0');
            const isActive = data['active'] === '1';
            const ecotax = parseFloat(data['ecotax_tax_excluded'] || '0');

            // 3. Upsert Product
            const existingProduct = await prisma.product.findUnique({ where: { slug: slug } });

            if (existingProduct) {
                await prisma.product.update({
                    where: { id: existingProduct.id },
                    data: {
                        name, price, stockQuantity: stock, categoryId: category.id, isActive, reference, ecotax
                    }
                });
            } else {
                await prisma.product.create({
                    data: {
                        name, slug, sku: reference, reference, price, stockQuantity: stock,
                        categoryId: category.id, isActive, ecotax,
                        images: data['id_image'] ? `legacy_${data['id_image']}.jpg` : null
                    }
                });
            }
            successCount++;

        } catch (e: unknown) {
            failCount++;
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            errors.push(`Row ${i + 1}: ${errorMessage}`);
        }
    }

    return { success: successCount, failed: failCount, errors };
}
