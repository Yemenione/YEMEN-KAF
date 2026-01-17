/**
 * Colissimo API Integration
 * 
 * Official Documentation: https://www.colissimo.entreprise.laposte.fr/fr/system/files/imagescontent/docs/spec_ws_affranchissement.pdf
 * 
 * This module provides integration with Colissimo's Simple Label Solution (SLS) Web Service
 * for shipping rate calculation, label generation, and tracking.
 */

interface ColissimoConfig {
    contractNumber: string;
    password: string;
    environment: 'sandbox' | 'production';
}

interface ShippingParams {
    weight: number; // kg
    dimensions?: {
        width: number;  // cm
        height: number; // cm
        depth: number;  // cm
    };
    destination: {
        country: string;      // ISO 2-letter code (FR, DE, etc.)
        postalCode: string;
        city: string;
        address: string;
        name: string;
        email?: string;
        phone?: string;
    };
    sender?: {
        country: string;
        postalCode: string;
        city: string;
        address: string;
        name: string;
        email?: string;
        phone?: string;
    };
    serviceLevel?: 'STANDARD' | 'EXPRESS';
    insuranceValue?: number; // EUR
}

interface ShippingRate {
    cost: number;
    deliveryDays: number;
    serviceCode: string;
    serviceName: string;
}

interface LabelResult {
    trackingNumber: string;
    labelUrl: string;
    customsFormUrl?: string;
    carrierData: any;
}

interface TrackingEvent {
    date: string;
    location: string;
    description: string;
    status: string;
}

interface TrackingResult {
    trackingNumber: string;
    status: string;
    deliveryDate?: string;
    events: TrackingEvent[];
}

/**
 * Get Colissimo configuration from environment variables
 */
function getConfig(): ColissimoConfig {
    const contractNumber = process.env.COLISSIMO_CONTRACT_NUMBER;
    const password = process.env.COLISSIMO_API_PASSWORD;
    const environment = (process.env.COLISSIMO_API_ENV || 'sandbox') as 'sandbox' | 'production';

    if (!contractNumber || !password) {
        throw new Error('Colissimo API credentials not configured. Please set COLISSIMO_CONTRACT_NUMBER and COLISSIMO_API_PASSWORD in .env');
    }

    return { contractNumber, password, environment };
}

/**
 * Get the appropriate API base URL based on environment
 */
function getBaseUrl(environment: 'sandbox' | 'production'): string {
    return environment === 'production'
        ? 'https://ws.colissimo.fr/sls-ws'
        : 'https://ws.colissimo.fr/sls-ws'; // Colissimo uses same URL, auth determines environment
}

/**
 * Calculate shipping cost for a given package
 * 
 * Note: Colissimo doesn't provide a direct rate API. This function uses
 * a simplified rate table based on weight and destination.
 * For production, consider integrating with a third-party rate engine like Cargoson.
 */
export async function calculateShipping(params: ShippingParams): Promise<ShippingRate[]> {
    const { weight, destination, serviceLevel } = params;

    // Simplified rate calculation based on Colissimo's published rates
    // Source: https://www.laposte.fr/professionnel/tarifs-colissimo
    const isDomestic = destination.country === 'FR';
    const isEU = ['BE', 'DE', 'ES', 'IT', 'LU', 'NL', 'PT'].includes(destination.country);

    let baseRate = 0;

    if (isDomestic) {
        // France domestic rates (2024)
        if (weight <= 0.25) baseRate = 4.95;
        else if (weight <= 0.5) baseRate = 5.95;
        else if (weight <= 1) baseRate = 7.35;
        else if (weight <= 2) baseRate = 8.55;
        else if (weight <= 5) baseRate = 12.55;
        else if (weight <= 10) baseRate = 17.30;
        else if (weight <= 30) baseRate = 28.55;
        else baseRate = 28.55 + ((weight - 30) * 2); // Estimate for >30kg
    } else if (isEU) {
        // EU rates
        if (weight <= 0.5) baseRate = 13.50;
        else if (weight <= 1) baseRate = 16.00;
        else if (weight <= 2) baseRate = 19.50;
        else if (weight <= 5) baseRate = 28.00;
        else if (weight <= 10) baseRate = 42.00;
        else if (weight <= 30) baseRate = 68.00;
        else baseRate = 68.00 + ((weight - 30) * 3);
    } else {
        // International (rest of world)
        if (weight <= 0.5) baseRate = 18.00;
        else if (weight <= 1) baseRate = 24.00;
        else if (weight <= 2) baseRate = 32.00;
        else if (weight <= 5) baseRate = 48.00;
        else if (weight <= 10) baseRate = 72.00;
        else if (weight <= 30) baseRate = 120.00;
        else baseRate = 120.00 + ((weight - 30) * 5);
    }

    const rates: ShippingRate[] = [];

    // Standard service
    rates.push({
        cost: parseFloat(baseRate.toFixed(2)),
        deliveryDays: isDomestic ? 2 : isEU ? 4 : 7,
        serviceCode: isDomestic ? 'DOM' : isEU ? 'COM' : 'COLI',
        serviceName: 'Colissimo Standard'
    });

    // Express service (if requested and available for domestic/EU)
    if ((serviceLevel === 'EXPRESS' || !serviceLevel) && (isDomestic || isEU)) {
        rates.push({
            cost: parseFloat((baseRate * 1.5).toFixed(2)),
            deliveryDays: isDomestic ? 1 : 2,
            serviceCode: isDomestic ? 'J+1' : 'CEXP',
            serviceName: 'Colissimo Express'
        });
    }

    return rates;
}

/**
 * Generate a shipping label via Colissimo API
 * 
 * This uses the generateLabel method from Colissimo's SLS Web Service
 */
export async function generateLabel(params: ShippingParams & {
    orderNumber: string;
    orderValue: number;
}): Promise<LabelResult> {
    const config = getConfig();
    const baseUrl = getBaseUrl(config.environment);

    // Default sender to business address if not provided
    const sender = params.sender || {
        country: 'FR',
        postalCode: '75001',
        city: 'Paris',
        address: '123 Rue de la Paix',
        name: 'Yemeni Market',
        email: process.env.SUPPORT_EMAIL || 'contact@yemeni-market.com',
        phone: process.env.SUPPORT_PHONE || '+33666336860'
    };

    // Determine service code based on destination
    const isDomestic = params.destination.country === 'FR';
    const isEU = ['BE', 'DE', 'ES', 'IT', 'LU', 'NL', 'PT'].includes(params.destination.country);

    let productCode = 'DOM'; // Default domestic
    if (!isDomestic) {
        productCode = isEU ? 'COM' : 'COLI'; // EU or International
    }

    // Build SOAP request for Colissimo API
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:sls="http://sls.ws.coliposte.fr">
   <soapenv:Header/>
   <soapenv:Body>
      <sls:generateLabel>
         <generateLabelRequest>
            <contractNumber>${config.contractNumber}</contractNumber>
            <password>${config.password}</password>
            <outputFormat>
               <x>0</x>
               <y>0</y>
               <outputPrintingType>PDF_A4_300dpi</outputPrintingType>
            </outputFormat>
            <letter>
               <service>
                  <productCode>${productCode}</productCode>
                  <depositDate>${new Date().toISOString().split('T')[0]}</depositDate>
                  <orderNumber>${params.orderNumber}</orderNumber>
               </service>
               <parcel>
                  <weight>${Math.ceil(params.weight * 1000)}</weight>
                  ${params.insuranceValue ? `<insuranceValue>${params.insuranceValue}</insuranceValue>` : ''}
               </parcel>
               <sender>
                  <address>
                     <companyName>${sender.name}</companyName>
                     <line2>${sender.address}</line2>
                     <countryCode>${sender.country}</countryCode>
                     <city>${sender.city}</city>
                     <zipCode>${sender.postalCode}</zipCode>
                     ${sender.email ? `<email>${sender.email}</email>` : ''}
                     ${sender.phone ? `<mobileNumber>${sender.phone}</mobileNumber>` : ''}
                  </address>
               </sender>
               <addressee>
                  <address>
                     <companyName>${params.destination.name}</companyName>
                     <line2>${params.destination.address}</line2>
                     <countryCode>${params.destination.country}</countryCode>
                     <city>${params.destination.city}</city>
                     <zipCode>${params.destination.postalCode}</zipCode>
                     ${params.destination.email ? `<email>${params.destination.email}</email>` : ''}
                     ${params.destination.phone ? `<mobileNumber>${params.destination.phone}</mobileNumber>` : ''}
                  </address>
               </addressee>
            </letter>
         </generateLabelRequest>
      </sls:generateLabel>
   </soapenv:Body>
</soapenv:Envelope>`;

    try {
        const response = await fetch(`${baseUrl}/SlsServiceWS/2.0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://sls.ws.coliposte.fr/generateLabel'
            },
            body: soapRequest
        });

        if (!response.ok) {
            throw new Error(`Colissimo API error: ${response.status} ${response.statusText}`);
        }

        const xmlText = await response.text();

        // Parse SOAP response (simplified - in production use a proper XML parser)
        const trackingNumberMatch = xmlText.match(/<parcelNumber>(.*?)<\/parcelNumber>/);
        const labelMatch = xmlText.match(/<label>(.*?)<\/label>/);

        if (!trackingNumberMatch || !labelMatch) {
            throw new Error('Invalid response from Colissimo API');
        }

        const trackingNumber = trackingNumberMatch[1];
        const labelBase64 = labelMatch[1];

        // Convert base64 label to data URL
        const labelUrl = `data:application/pdf;base64,${labelBase64}`;

        return {
            trackingNumber,
            labelUrl,
            carrierData: {
                carrier: 'Colissimo',
                service: productCode,
                generatedAt: new Date().toISOString(),
                rawResponse: xmlText
            }
        };

    } catch (error: any) {
        console.error('Colissimo label generation failed:', error);
        throw new Error(`Failed to generate Colissimo label: ${error.message}`);
    }
}

/**
 * Track a shipment using Colissimo tracking API
 * 
 * Uses La Poste's public tracking API
 */
export async function trackShipment(trackingNumber: string): Promise<TrackingResult> {
    try {
        // La Poste public tracking API
        const response = await fetch(
            `https://api.laposte.fr/suivi/v2/idships/${trackingNumber}?lang=fr_FR`,
            {
                headers: {
                    'X-Okapi-Key': process.env.LAPOSTE_API_KEY || '',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Tracking API error: ${response.status}`);
        }

        const data = await response.json();
        const shipment = data.shipment;

        const events: TrackingEvent[] = (shipment.event || []).map((evt: any) => ({
            date: evt.date,
            location: evt.site?.name || 'Unknown',
            description: evt.label || 'Status update',
            status: evt.code
        }));

        return {
            trackingNumber,
            status: shipment.timeline?.[0]?.shortLabel || 'In Transit',
            deliveryDate: shipment.deliveryDate,
            events
        };

    } catch (error: any) {
        console.error('Colissimo tracking failed:', error);

        // Return minimal data if tracking fails
        return {
            trackingNumber,
            status: 'Tracking unavailable',
            events: []
        };
    }
}

/**
 * Validate if Colissimo service is available for a destination
 */
export function isServiceAvailable(countryCode: string): boolean {
    // Colissimo serves France, EU, and most international destinations
    const unsupportedCountries = ['KP', 'SY', 'IR']; // Example restricted countries
    return !unsupportedCountries.includes(countryCode);
}

/**
 * Calculate total package weight from order items
 */
export function calculateTotalWeight(items: Array<{ weight?: number; quantity: number }>): number {
    const totalWeight = items.reduce((sum, item) => {
        const itemWeight = item.weight || 0.5; // Default 500g if not specified
        return sum + (itemWeight * item.quantity);
    }, 0);

    return Math.max(totalWeight, 0.1); // Minimum 100g
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDelivery(deliveryDays: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + deliveryDays);

    // Skip weekends
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }

    return date;
}
