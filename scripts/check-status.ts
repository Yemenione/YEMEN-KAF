
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔍 Checking Corn Product Status...');

    const product = await prisma.product.findFirst({
        where: { slug: 'corn' },
        include: { category: true }
    });

    if (!product) {
        console.log('❌ Product "corn" not found');
        return;
    }

    console.log(`✅ Found Corn (ID: ${product.id})`);
    console.log(`   isActive: ${product.isActive}`); // Should be true
    console.log(`   Price: ${product.price}`);
    console.log(`   Stock: ${product.stockQuantity}`);
    console.log(`   Category ID: ${product.categoryId}`);
    console.log(`   Category Name: ${product.category?.name}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
