
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🌱 Seeding Advanced E-commerce Data...');

    // 1. Seed Attributes (Volume, Weight, Size)
    // We check if they exist first to avoid duplicates if re-run
    const attributesToSeed = [
        { name: 'Volume', publicName: 'Contenance', type: 'select', values: ['50ml', '100ml', '250ml', '500ml', '1L'] },
        { name: 'Weight', publicName: 'Poids', type: 'select', values: ['100g', '250g', '500g', '1kg'] },
        { name: 'Size', publicName: 'Taille', type: 'select', values: ['S', 'M', 'L', 'XL'] },
        { name: 'Material', publicName: 'Matière', type: 'select', values: ['Glass', 'Plastic', 'Metal'] }
    ];

    for (const attr of attributesToSeed) {
        let attribute = await prisma.attribute.findFirst({ where: { name: attr.name } });

        if (!attribute) {
            console.log(`   Creating Attribute: ${attr.name}`);
            attribute = await prisma.attribute.create({
                data: {
                    name: attr.name,
                    publicName: attr.publicName,
                    type: attr.type
                }
            });
        } else {
            console.log(`   Attribute ${attr.name} already exists.`);
        }

        // Create Values
        for (const valName of attr.values) {
            const exists = await prisma.attributeValue.findFirst({
                where: { attributeId: attribute.id, name: valName }
            });

            if (!exists) {
                await prisma.attributeValue.create({
                    data: {
                        attributeId: attribute.id,
                        name: valName,
                        value: valName // Simple string value
                    }
                });
                console.log(`      + Added Value: ${valName}`);
            }
        }
    }

    // 2. Seed Tax Rules (France)
    const taxRules = [
        { name: 'Standard Rate (France)', rate: 20.0, country: 'FR', priority: 1 },
        { name: 'Reduced Rate (Food)', rate: 5.5, country: 'FR', priority: 2 }
    ];

    for (const rule of taxRules) {
        const exists = await prisma.taxRule.findFirst({ where: { name: rule.name } });
        if (!exists) {
            await prisma.taxRule.create({
                data: {
                    name: rule.name,
                    rate: rule.rate,
                    country: rule.country,
                    priority: rule.priority
                }
            });
            console.log(`   ✅ Created Tax Rule: ${rule.name} (${rule.rate}%)`);
        } else {
            console.log(`   Tax Rule ${rule.name} already exists.`);
        }
    }

    console.log('✅ Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
