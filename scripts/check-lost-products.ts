
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for products with potential visibility issues...');
  
  const productsWithNoCategory = await prisma.product.findMany({
    where: {
      categoryId: null
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true
    }
  });

  console.log(`Found ${productsWithNoCategory.length} products with NO Category (likely "disappeared" from shop):`);
  productsWithNoCategory.forEach(p => {
    console.log(`- [${p.id}] ${p.name} (Active: ${p.isActive})`);
  });

  const inactiveProducts = await prisma.product.findMany({
    where: {
      isActive: false,
      NOT: {
          categoryId: null // Don't double count
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: { select: { name: true } }
    }
  });

   console.log(`Found ${inactiveProducts.length} INACTIVE products (but have category):`);
   inactiveProducts.forEach(p => {
    console.log(`- [${p.id}] ${p.name} in ${p.category?.name}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
