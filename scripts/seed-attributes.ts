
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Attributes...');

    // 1. Color
    const color = await prisma.attribute.upsert({
        where: { id: 1 }, // Assuming ID 1, or we can query by name if needed but name isn't unique constraint in schema, so let's use create usually. But here checks if exists.
        // Better logic: check by name first
        update: {},
        create: {
            name: 'Color',
            publicName: 'Couleur',
            type: 'color',
            values: {
                create: [
                    { name: 'Red', value: '#FF0000', position: 1 },
                    { name: 'Blue', value: '#0000FF', position: 2 },
                    { name: 'Green', value: '#008000', position: 3 },
                    { name: 'Black', value: '#000000', position: 4 },
                    { name: 'White', value: '#FFFFFF', position: 5 },
                ]
            }
        },
    });
    console.log('✅ Attribute Color seeded');

    // 2. Size
    // We can't easily upsert by name with prisma's upsert if name isn't unique. 
    // Let's check if it exists.
    const sizeExists = await prisma.attribute.findFirst({ where: { name: 'Size' } });
    if (!sizeExists) {
        await prisma.attribute.create({
            data: {
                name: 'Size',
                publicName: 'Taille',
                type: 'select',
                values: {
                    create: [
                        { name: 'S', position: 1 },
                        { name: 'M', position: 2 },
                        { name: 'L', position: 3 },
                        { name: 'XL', position: 4 },
                    ]
                }
            }
        });
        console.log('✅ Attribute Size seeded');
    } else {
        console.log('ℹ️ Attribute Size already exists');
    }

    // 3. Material
    const materialExists = await prisma.attribute.findFirst({ where: { name: 'Material' } });
    if (!materialExists) {
        await prisma.attribute.create({
            data: {
                name: 'Material',
                publicName: 'Matière',
                type: 'select',
                values: {
                    create: [
                        { name: 'Cotton', position: 1 },
                        { name: 'Polyester', position: 2 },
                        { name: 'Silk', position: 3 },
                        { name: 'Wool', position: 4 },
                    ]
                }
            }
        });
        console.log('✅ Attribute Material seeded');
    } else {
        console.log('ℹ️ Attribute Material already exists');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
