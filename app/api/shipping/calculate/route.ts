import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTotalWeight } from '@/lib/shipping/colissimo';

/**
 * POST /api/shipping/calculate
 * 
 * Calculate shipping rates based on Database Rules (Prisma)
 * with DB-first approach, falling back to static logic only if needed.
 */
interface ShippingItem {
    id: string | number;
    quantity: number;
}

interface ShippingDestination {
    country: string;
    postalCode?: string;
    city?: string;
}

interface ShippingRateResponse {
    cost: number;
    deliveryDays: number;
    serviceCode: string;
    serviceName: string;
    carrierLogo: string;
    carrierId: number | string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, destination, country }: { items: ShippingItem[], destination?: ShippingDestination, country?: string } = body;

        // Normalize destination
        const dest = destination || {
            country: country || 'FR',
            postalCode: '75001',
            city: 'Paris'
        };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ rates: [] });
        }

        if (!dest.country) {
            return NextResponse.json({ rates: [] });
        }

        // 1. Fetch Product Weights using Prisma
        const productIds = items.map((item) => Number(item.id));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                weight: true,
                width: true,
                height: true,
                depth: true
            }
        });

        // 2. Calculate Total Weight
        const itemsWithWeight = items.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return {
                weight: product?.weight ? Number(product.weight) : 0.5,
                quantity: item.quantity
            };
        });

        const totalWeight = calculateTotalWeight(itemsWithWeight); // in kg
        const weightInGrams = Math.ceil(totalWeight * 1000); // DB usually stores in grams or checks ranges

        // 3. Find Matching Shipping Zone
        // Logic: Find a zone that includes the destination country
        // The country list is stored as a stringified JSON array in DB (e.g. '["FR", "MC"]')
        const zones = await prisma.shippingZone.findMany({
            where: { isActive: true },
            include: { rates: { include: { carrier: true } } }
        });

        const matchedZone = zones.find(z => {
            try {
                const countries = JSON.parse(z.countries);
                return countries.includes(dest.country);
            } catch (e) {
                return false;
            }
        });

        const rates = [];

        if (matchedZone) {
            // 4. Find Rates for this Zone and Weight
            // We need to query rates for this zone where weight is within range
            const applicableRates = await prisma.shippingRate.findMany({
                where: {
                    zoneId: matchedZone.id,
                    minWeight: { lte: weightInGrams },
                    maxWeight: { gte: weightInGrams },
                    carrier: { isActive: true }
                },
                include: { carrier: true }
            });

            // Deduplicate rates: Keep the lowest price per carrier
            const uniqueRatesMap = new Map();

            for (const rate of applicableRates) {
                const existing = uniqueRatesMap.get(rate.carrier.id);
                if (!existing || Number(rate.price) < Number(existing.price)) {
                    uniqueRatesMap.set(rate.carrier.id, rate);
                }
            }

            rates.push(...Array.from(uniqueRatesMap.values()).map((rate): ShippingRateResponse => ({
                cost: Number(rate.price),
                deliveryDays: rate.carrier.code === 'dhl' ? 1 : (rate.carrier.code === 'colissimo' ? 2 : 4),
                serviceCode: rate.carrier.code || 'STANDARD',
                serviceName: rate.carrier.name,
                carrierId: rate.carrier.id,
                carrierLogo: rate.carrier.logo
            })));
        }

        // 5. Fallback if no DB rates found (Safety Net)
        if (rates.length === 0) {
            // FR Fallback
            if (dest.country === 'FR') {
                let cost = 4.95;
                if (totalWeight > 0.25) cost = 5.95;
                if (totalWeight > 0.5) cost = 7.35;
                if (totalWeight > 1) cost = 8.55;
                if (totalWeight > 2) cost = 12.55;

                rates.push({
                    cost: cost,
                    deliveryDays: 2,
                    serviceCode: 'DOM',
                    serviceName: 'Colissimo Domicile (Standard)',
                    carrierLogo: '/uploads/carriers/colissimo.png', // Fallback path if exists
                    carrierId: 999
                });
            }
            // Europe Fallback (DHL + Colissimo Int)
            else if (['DE', 'BE', 'NL', 'ES', 'IT', 'CH', 'AT', 'PT', 'SE', 'NO', 'DK', 'FI', 'IE', 'GB'].includes(dest.country)) {
                // DHL Rate Calculation (Mock)
                let dhlCost = 14.90;
                if (totalWeight > 1) dhlCost = 19.90;
                if (totalWeight > 2) dhlCost = 24.90;

                rates.push({
                    cost: dhlCost,
                    deliveryDays: 1,
                    serviceCode: 'DHL_EXP',
                    serviceName: 'DHL Express Europe',
                    carrierLogo: '/uploads/carriers/dhl.png', // Assuming user will upload or it exists
                    carrierId: 888
                });

                // Colissimo International
                let coliCost = 12.90;
                if (totalWeight > 1) coliCost = 15.90;

                rates.push({
                    cost: coliCost,
                    deliveryDays: 3,
                    serviceCode: 'COLI_INT',
                    serviceName: 'Colissimo International',
                    carrierLogo: '/uploads/carriers/colissimo.png',
                    carrierId: 999
                });
            }
        }

        return NextResponse.json({
            success: true,
            rates,
            totalWeight,
            zoneFound: matchedZone?.name
        });

    } catch (error: unknown) {
        console.error('Shipping calculation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown shipping error';

        return NextResponse.json({
            success: false,
            rates: [],
            error: errorMessage
        }, { status: 500 });
    }
}
