import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { calculateShipping, calculateTotalWeight } from '@/lib/shipping/colissimo';
import { RowDataPacket } from 'mysql2';

interface ShippingProductRow extends RowDataPacket {
    id: number;
    weight: string;
    width: string;
    height: string;
    depth: string;
}

interface ShippingItem {
    id: number;
    quantity: number;
}

interface DimensionAccumulator {
    width: number;
    height: number;
    depth: number;
}

/**
 * POST /api/shipping/calculate
 * 
 * Calculate shipping rates for cart items using Colissimo API
 * 
 * Request body:
 * {
 *   items: [{ id: number, quantity: number }],  // Product IDs and quantities
 *   destination: { country: string, postalCode: string, city?: string, address?: string, name?: string }
 * }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, destination, country } = body;

        // Support both old format (country only) and new format (full destination)
        const dest = destination || { country: country || 'FR', postalCode: '75001', city: 'Paris', address: '', name: 'Customer' };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ rates: [] });
        }

        if (!dest.country) {
            return NextResponse.json({ rates: [] });
        }

        // Fetch product details (weight, dimensions) from database
        const productIds = items.map((item: ShippingItem) => item.id);
        const placeholders = productIds.map(() => '?').join(',');

        const [products] = await pool.execute<ShippingProductRow[]>(
            `SELECT id, weight, width, height, depth FROM products WHERE id IN(${placeholders})`,
            productIds
        );

        // Build items with weight data
        const itemsWithWeight = items.map((item: ShippingItem) => {
            const product = products.find((p) => p.id === item.id);
            return {
                weight: product?.weight ? parseFloat(product.weight) : 0.5,
                quantity: item.quantity
            };
        });

        // Calculate total weight
        const totalWeight = calculateTotalWeight(itemsWithWeight);

        // Get largest dimensions (for multi-item shipments, use largest product dimensions)
        const maxDimensions = products.reduce<DimensionAccumulator>((max, product) => {
            const width = parseFloat(product.width) || 10;
            const height = parseFloat(product.height) || 10;
            const depth = parseFloat(product.depth) || 10;

            return {
                width: Math.max(max.width, width),
                height: Math.max(max.height, height),
                depth: Math.max(max.depth, depth)
            };
        }, { width: 10, height: 10, depth: 10 });

        // Calculate shipping rates using Colissimo
        const rates = await calculateShipping({
            weight: totalWeight,
            dimensions: maxDimensions,
            destination: {
                country: dest.country,
                postalCode: dest.postalCode || '75001',
                city: dest.city || '',
                address: dest.address || '',
                name: dest.name || 'Customer'
            }
        });

        return NextResponse.json({
            success: true,
            rates,
            totalWeight,
            dimensions: maxDimensions
        });

    } catch (error: unknown) {
        console.error('Shipping calculation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown shipping error';

        // Fallback to static rate if Colissimo fails
        return NextResponse.json({
            success: true,
            rates: [{
                cost: 5.00,
                deliveryDays: 3,
                serviceCode: 'STANDARD',
                serviceName: 'Standard Shipping (Estimated)'
            }],
            fallback: true,
            totalWeight: 0.5,
            error: errorMessage
        });
    }
}
