
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring products...');

    // 1. Find or Create "Restored Products" Category
    let category = await prisma.category.findFirst({
        where: { name: "Restored Products" }
    });

    if (!category) {
        console.log('Creating "Restored Products" category...');
        category = await prisma.category.create({
            data: {
                name: "Restored Products",
                slug: "restored-products-" + Date.now(),
                isActive: true
            }
        });
    }

    // 2. Find Orphaned Products
    const lostProducts = await prisma.product.findMany({
        where: {
            categoryId: null
        }
    });

    console.log(`Found ${lostProducts.length} products with NO Category.`);

    if (lostProducts.length > 0) {
        const updateResult = await prisma.product.updateMany({
            where: { categoryId: null },
            data: {
                categoryId: category.id,
                isActive: true
            }
        });
        console.log(`Restored ${updateResult.count} products to "${category.name}".`);
    }

    // 3. Find Inactive Products (Optional: List them)
    const inactive = await prisma.product.count({ where: { isActive: false } });
    console.log(`There are currently ${inactive} other inactive products.`);

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
