const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'yemeni-royal-blend-reserve';

    // Clean up
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
        await prisma.product.delete({ where: { slug } });
    }

    // 1. Create Attributes
    const weightAttr = await prisma.attribute.upsert({
        where: { id: 100 },
        update: {},
        create: { id: 100, name: 'Weight', publicName: 'Poids', type: 'select' }
    });

    const grindAttr = await prisma.attribute.upsert({
        where: { id: 101 },
        update: {},
        create: { id: 101, name: 'Grind', publicName: 'Mouture', type: 'select' }
    });

    // 2. Create Attribute Values
    const v250g = await prisma.attributeValue.upsert({
        where: { id: 200 },
        update: {},
        create: { id: 200, attributeId: weightAttr.id, name: '250g', value: '250g' }
    });

    const v500g = await prisma.attributeValue.upsert({
        where: { id: 201 },
        update: {},
        create: { id: 201, attributeId: weightAttr.id, name: '500g', value: '500g' }
    });

    const vWholeBean = await prisma.attributeValue.upsert({
        where: { id: 202 },
        update: {},
        create: { id: 202, attributeId: grindAttr.id, name: 'Whole Bean', value: 'Grain' }
    });

    const vEspresso = await prisma.attributeValue.upsert({
        where: { id: 203 },
        update: {},
        create: { id: 203, attributeId: grindAttr.id, name: 'Espresso', value: 'Espresso' }
    });

    // 3. Create Product
    const product = await prisma.product.create({
        data: {
            name: 'Yemeni Royal Blend Reserve',
            slug: slug,
            price: 45.00,
            description: '<p>A masterpiece of Yemeni coffee heritage. This blend represents the pinnacle of high-altitude cultivation from the Haraaz and Bani Matar regions.</p>',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop'
            ]),
            translations: JSON.stringify({
                fr: {
                    name: 'Réserve Royale du Yémen',
                    description: '<p>Un chef-d\'œuvre du patrimoine caféier yéménite.</p>',
                    tasting_notes: ['Chocolat Noir', 'Cerise séchée', 'Épices Exotiques']
                }
            }),
            originCountry: 'Yemen',
            categoryId: 8,
            stockQuantity: 100,
            variants: {
                create: [
                    {
                        name: '250g - Grain',
                        sku: 'YRB-250-WB',
                        price: 45.00,
                        stock: 50,
                        attributeValues: {
                            create: [
                                { attributeValueId: v250g.id },
                                { attributeValueId: vWholeBean.id }
                            ]
                        }
                    },
                    {
                        name: '500g - Grain',
                        sku: 'YRB-500-WB',
                        price: 82.00,
                        stock: 30,
                        attributeValues: {
                            create: [
                                { attributeValueId: v500g.id },
                                { attributeValueId: vWholeBean.id }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('Product created with attributes:', product.slug);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
