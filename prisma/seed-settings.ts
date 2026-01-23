import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting generic seed...');

    // 1. Store Configuration (The "Identity" Card)
    const configs = [
        { key: 'store_name', value: 'Yemeni Market', group: 'general' },
        { key: 'store_email', value: 'contact@yemenimarket.com', group: 'general' },
        { key: 'store_phone', value: '+33 6 00 00 00 00', group: 'general' },
        { key: 'store_address', value: '123 Avenue des Champs-Élysées, 75008 Paris', group: 'general' },
        { key: 'vat_number', value: 'FR12345678901', group: 'accounting' },
        { key: 'invoice_prefix', value: 'INV-2025-', group: 'accounting' },
        { key: 'currency', value: 'EUR', group: 'general' },
    ];

    for (const config of configs) {
        await prisma.storeConfig.upsert({
            where: { key: config.key },
            update: { value: config.value, group: config.group },
            create: { key: config.key, value: config.value, group: config.group, type: 'text', isPublic: true },
        });
    }
    console.log('✅ Store Config loaded');

    // 2. Tax Rules (VAT)
    const taxes = [
        { name: 'TVA Standard (20%)', rate: 20.00 },
        { name: 'TVA Réduite (5.5%)', rate: 5.50 },
        { name: 'Exonéré (0%)', rate: 0.00 },
    ];

    for (const tax of taxes) {
        await prisma.taxRule.create({
            data: {
                name: tax.name,
                rate: tax.rate,
                country: 'FR',
                isActive: true
            }
        });
    }
    console.log('✅ Tax Rules loaded');

    // 3. Shipping Zones
    const zoneFr = await prisma.shippingZone.create({
        data: {
            name: 'France Métropolitaine',
            countries: JSON.stringify(['FR', 'MC']), // France, Monaco
            isActive: true
        }
    });

    // 4. Carriers & Rates (The "Engine")

    // --- Colissimo (Home Delivery) ---
    const colissimo = await prisma.carrier.upsert({
        where: { code: 'colissimo' },
        update: {},
        create: {
            name: 'Colissimo Domicile',
            code: 'colissimo',
            type: 'home',
            description: 'Livraison à domicile sans signature (48h)',
            deliveryTime: '2-3 jours ouvrés',
            logo: '/images/carriers/colissimo.png',
            trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code={tracking_number}',
            isActive: true
        }
    });

    // Colissimo 2025 Public Rates (Net)
    const colissimoRates = [
        { max: 250, price: 4.95 },
        { max: 500, price: 6.70 },
        { max: 750, price: 7.60 },
        { max: 1000, price: 8.25 },
        { max: 2000, price: 9.55 },
        { max: 5000, price: 14.65 },
        { max: 10000, price: 21.30 },
        { max: 30000, price: 29.70 }, // 30kg max
    ];

    for (const rate of colissimoRates) {
        await prisma.shippingRate.create({
            data: {
                carrierId: colissimo.id,
                zoneId: zoneFr.id,
                minWeight: 0, // Simplified: previous max is implied start or overlap handled by logic
                maxWeight: rate.max,
                price: rate.price
            }
        });
    }
    console.log('✅ Colissimo Rates loaded');

    // --- Mondial Relay (Pick-up) ---
    const mondial = await prisma.carrier.upsert({
        where: { code: 'mondial_relay' },
        update: {},
        create: {
            name: 'Mondial Relay',
            code: 'mondial_relay',
            type: 'pudo',
            description: 'Livraison en Point Relais® (3-5 jours)',
            deliveryTime: '3-5 jours ouvrés',
            logo: '/images/carriers/mondial-relay.png',
            trackingUrl: 'https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition={tracking_number}',
            isActive: true
        }
    });

    // Mondial Relay 2025 Standard Rates
    const mondialRates = [
        { max: 500, price: 4.40 },
        { max: 1000, price: 4.90 },
        { max: 2000, price: 6.50 },
        { max: 3000, price: 6.70 },
        { max: 4000, price: 6.90 },
        { max: 5000, price: 11.55 }, // Jump usually happens here for large boxes
        { max: 10000, price: 13.90 },
        { max: 30000, price: 19.50 },
    ];

    for (const rate of mondialRates) {
        await prisma.shippingRate.create({
            data: {
                carrierId: mondial.id,
                zoneId: zoneFr.id,
                minWeight: 0,
                maxWeight: rate.max,
                price: rate.price
            }
        });
    }
    console.log('✅ Mondial Relay Rates loaded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
