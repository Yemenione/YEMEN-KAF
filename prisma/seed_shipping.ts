import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📦 Seeding Shipping Data for France...');

    // 1. Find or Create Zone
    let zoneFr = await prisma.shippingZone.findFirst({
        where: { name: 'France Métropolitaine' }
    });

    if (!zoneFr) {
        zoneFr = await prisma.shippingZone.create({
            data: {
                name: 'France Métropolitaine',
                countries: JSON.stringify(['FR', 'MC']), // France, Monaco
                isActive: true
            }
        });
    }

    // 2. Upsert Carriers
    const colissimo = await prisma.carrier.upsert({
        where: { code: 'colissimo' },
        update: {},
        create: {
            name: 'Colissimo Domicile',
            code: 'colissimo',
            description: 'Livraison à domicile en 48h',
            deliveryTime: '2 - 3 jours',
            type: 'home',
            isActive: true
        }
    });

    const mondialRelay = await prisma.carrier.upsert({
        where: { code: 'mondial_relay' },
        update: {},
        create: {
            name: 'Mondial Relay',
            code: 'mondial_relay',
            description: 'Livraison en Point Relais',
            deliveryTime: '3 - 5 jours',
            type: 'pudo',
            isActive: true
        }
    });

    // 3. Clear existing rates for this zone/carrier to avoid duplicates ?
    // For safety, we'll deleteMany for these specific carriers in this zone before re-adding
    await prisma.shippingRate.deleteMany({
        where: {
            zoneId: zoneFr.id,
            carrierId: { in: [colissimo.id, mondialRelay.id] }
        }
    });

    // 4. Add Colissimo Rates
    const colissimoRates = [
        { max: 250, price: 4.95 },
        { max: 500, price: 6.70 },
        { max: 750, price: 7.60 },
        { max: 1000, price: 8.25 },
        { max: 2000, price: 9.55 },
        { max: 5000, price: 14.65 },
        { max: 10000, price: 21.30 },
        { max: 30000, price: 29.55 },
    ];

    for (const r of colissimoRates) {
        await prisma.shippingRate.create({
            data: {
                carrierId: colissimo.id,
                zoneId: zoneFr.id,
                minWeight: 0,
                maxWeight: r.max,
                price: r.price
            }
        });
    }

    // 5. Add Mondial Relay Rates
    const mondialRates = [
        { max: 500, price: 4.40 },
        { max: 1000, price: 4.90 },
        { max: 2000, price: 6.50 },
        { max: 5000, price: 10.90 },
        { max: 10000, price: 13.90 },
        { max: 30000, price: 19.90 },
    ];

    for (const r of mondialRates) {
        await prisma.shippingRate.create({
            data: {
                carrierId: mondialRelay.id,
                zoneId: zoneFr.id,
                minWeight: 0,
                maxWeight: r.max,
                price: r.price
            }
        });
    }

    console.log('✅ Shipping Data Seeded/Sync Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
