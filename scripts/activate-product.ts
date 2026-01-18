
import { prisma } from '@/lib/prisma';

async function main() {
    const slug = 'corn';
    console.log(`🔌 Reactivating product: ${slug}`);

    const updated = await prisma.product.update({
        where: { slug },
        data: { isActive: true }
    });

    console.log(`✅ Product "${updated.name}" is now ACTIVE.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
