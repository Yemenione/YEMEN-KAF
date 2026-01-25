import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting advanced seed...');

    // 1. Get Categories
    const honeyCat = await prisma.category.findUnique({ where: { slug: 'honey' } });
    const coffeeCat = await prisma.category.findUnique({ where: { slug: 'coffee' } });

    if (!honeyCat || !coffeeCat) {
        console.error('Categories not found. Please run basic seed first.');
        return;
    }

    // 2. Create Attributes
    const weightAttr = await prisma.attribute.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Weight',
            publicName: 'Poids',
            type: 'select'
        }
    });

    const v250 = await prisma.attributeValue.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, attributeId: weightAttr.id, name: '250g', value: '250' }
    });

    const v500 = await prisma.attributeValue.upsert({
        where: { id: 2 },
        update: {},
        create: { id: 2, attributeId: weightAttr.id, name: '500g', value: '500' }
    });

    const v1kg = await prisma.attributeValue.upsert({
        where: { id: 3 },
        update: {},
        create: { id: 3, attributeId: weightAttr.id, name: '1kg', value: '1000' }
    });

    // 3. Update Existing Product to have Variants (e.g., Royal Sidr Honey)
    const sidr = await prisma.product.findUnique({ where: { slug: 'royal-sidr-honey' } });
    if (sidr) {
        // Create Variants
        await prisma.productVariant.upsert({
            where: { sku: 'SIDR-250G' },
            create: {
                productId: sidr.id,
                name: '250g Pot',
                sku: 'SIDR-250G',
                price: 65.00,
                stock: 100,
                attributeValues: {
                    create: { attributeValueId: v250.id }
                }
            },
            update: { price: 65.00 }
        });

        await prisma.productVariant.upsert({
            where: { sku: 'SIDR-500G' },
            create: {
                productId: sidr.id,
                name: '500g Pot',
                sku: 'SIDR-500G',
                price: 120.00,
                stock: 50,
                attributeValues: {
                    create: { attributeValueId: v500.id }
                }
            },
            update: { price: 120.00 }
        });

        await prisma.productVariant.upsert({
            where: { sku: 'SIDR-1KG' },
            create: {
                productId: sidr.id,
                name: '1kg Pot',
                sku: 'SIDR-1KG',
                price: 230.00,
                stock: 20,
                attributeValues: {
                    create: { attributeValueId: v1kg.id }
                }
            },
            update: { price: 230.00 }
        });
    }

    // 4. Create some Reviews
    const demoCustomer = await prisma.customer.findFirst();
    if (demoCustomer && sidr) {
        const reviews = [
            {
                rating: 5,
                comment: "Le meilleur miel que j'ai jamais goûté ! Une texture incroyable.",
                customerId: demoCustomer.id,
                productId: sidr.id,
                isVerified: true
            },
            {
                rating: 4,
                comment: "Très bon produit, mais la livraison a pris un peu de temps.",
                customerId: demoCustomer.id,
                productId: sidr.id,
                isVerified: true
            }
        ];

        for (const r of reviews) {
            await prisma.review.create({
                data: r
            });
        }
    }

    console.log('Advanced Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
