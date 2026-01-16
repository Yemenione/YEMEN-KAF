export type Carrier = 'colissimo' | 'dpd' | 'dhl' | 'standard';

export interface ShippingRate {
    id: string;
    carrier: Carrier;
    name: string;
    price: number;
    estimatedDays: string;
}

export const SHIPPING_ZONES = {
    FR: ['France', 'Monaco'],
    EU: ['Belgium', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Portugal'],
    WORLD: ['United States', 'United Kingdom', 'Yemen', 'Saudi Arabia', 'UAE']
};

export const WEIGHT_BRACKETS_FR = [
    { maxWeight: 0.25, price: 4.95 },
    { maxWeight: 0.5, price: 6.70 },
    { maxWeight: 0.75, price: 7.60 },
    { maxWeight: 1.0, price: 8.25 },
    { maxWeight: 2.0, price: 9.55 },
    { maxWeight: 5.0, price: 14.65 },
    { maxWeight: 10.0, price: 21.30 },
    { maxWeight: 30.0, price: 29.70 },
];

export const WEIGHT_BRACKETS_EU = [
    { maxWeight: 0.5, price: 13.45 },
    { maxWeight: 1.0, price: 16.60 },
    { maxWeight: 2.0, price: 18.80 },
    { maxWeight: 5.0, price: 24.05 },
    { maxWeight: 10.0, price: 38.90 },
];

export const WEIGHT_BRACKETS_WORLD = [
    { maxWeight: 0.5, price: 29.55 },
    { maxWeight: 1.0, price: 32.85 },
    { maxWeight: 2.0, price: 44.95 },
    { maxWeight: 5.0, price: 64.80 },
    { maxWeight: 10.0, price: 121.70 },
];

export function getShippingRates(country: string, totalWeightKg: number): ShippingRate[] {
    // Determine Zone
    let zone: 'FR' | 'EU' | 'WORLD' = 'WORLD';
    if (SHIPPING_ZONES.FR.includes(country)) zone = 'FR';
    else if (SHIPPING_ZONES.EU.includes(country)) zone = 'EU';

    // Get Base Price based on weight
    let basePrice = 0;
    const brackets = zone === 'FR' ? WEIGHT_BRACKETS_FR : (zone === 'EU' ? WEIGHT_BRACKETS_EU : WEIGHT_BRACKETS_WORLD);

    const bracket = brackets.find(b => totalWeightKg <= b.maxWeight) || brackets[brackets.length - 1];
    basePrice = bracket.price;

    const rates: ShippingRate[] = [];

    if (zone === 'FR') {
        // Colissimo (Standard)
        rates.push({
            id: 'colissimo_standard',
            carrier: 'colissimo',
            name: 'Colissimo Domicile',
            price: basePrice,
            estimatedDays: '2-3 business days'
        });

        // DPD (Express-ish or alternative) check if slightly cheaper or more expensive?
        // Let's assume DPD is slightly cheaper for heavier items or similar.
        rates.push({
            id: 'dpd_predict',
            carrier: 'dpd',
            name: 'DPD Predict',
            price: basePrice + 1.50, // Premium service example
            estimatedDays: '1-2 business days'
        });
    } else if (zone === 'EU') {
        rates.push({
            id: 'colissimo_int',
            carrier: 'colissimo',
            name: 'Colissimo International',
            price: basePrice,
            estimatedDays: '3-5 business days'
        });
        rates.push({
            id: 'dhl_eu',
            carrier: 'dhl',
            name: 'DHL Express',
            price: basePrice * 1.5,
            estimatedDays: '1-2 business days'
        });
    } else {
        rates.push({
            id: 'standard_int',
            carrier: 'standard',
            name: 'International Standard',
            price: basePrice,
            estimatedDays: '7-14 business days'
        });
        rates.push({
            id: 'dhl_world',
            carrier: 'dhl',
            name: 'DHL Express Worldwide',
            price: basePrice * 2.5, // Expensive!
            estimatedDays: '2-4 business days'
        });
    }

    return rates;
}
