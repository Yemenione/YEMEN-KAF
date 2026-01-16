import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getShippingRates, ShippingRate } from '@/lib/shipping-rates';

export async function POST(req: Request) {
    try {
        const { items, country } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ rates: [] });
        }

        if (!country) {
            return NextResponse.json({ rates: [] });
        }

        // Fetch weights from DB
        const ids = items.map((item: any) => item.id);
        if (ids.length === 0) return NextResponse.json({ rates: [] });

        // Create placeholders ? for the IN clause
        const placeholders = ids.map(() => '?').join(',');

        // We will try to select 'weight' if it exists, otherwise we mock it in code if the column is missing 
        // (handling gracefully if the column doesn't exist yet would require a try-catch on the query, 
        // but for now let's assume we can fetch it or default it).
        // Since we can't easily alter the DB here without risk, let's fetch products and IF weight is missing, default to 0.5.
        // Actually, to be safe, let's just fetch p.*

        // Fetch product details (using * to be safe if weight column is missing, defaulting to 0.5kg later)
        const [products]: any = await pool.execute(
            `SELECT * FROM products WHERE id IN (${placeholders})`,
            ids
        );

        let totalWeight = 0;

        items.forEach((item: any) => {
            const product = products.find((p: any) => p.id === item.id);
            // Default weight 0.5kg if null or undefined
            const weight = product?.weight ? Number(product.weight) : 0.500;
            totalWeight += weight * item.quantity;
        });

        // Round to 3 decimals
        totalWeight = Math.round(totalWeight * 1000) / 1000;

        // Calculate Rates
        const rates = getShippingRates(country, totalWeight);

        return NextResponse.json({ rates, totalWeight });

    } catch (error) {
        console.error("Shipping calculation error:", error);
        // Fallback or empty rates
        return NextResponse.json({ rates: [], error: 'Failed to calculate shipping' }, { status: 500 });
    }
}
