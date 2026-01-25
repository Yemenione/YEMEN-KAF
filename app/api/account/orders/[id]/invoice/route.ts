import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

// Helper to fetch store settings
async function getStoreSettings() {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT `key`, `value` FROM store_config');
    const settings: Record<string, string> = {};
    rows.forEach((row) => {
        settings[row.key] = row.value;
    });
    return settings;
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const token = (await cookies()).get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;
        const orderId = params.id;

        // Fetch order details
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT o.*, 
                    u.email, u.first_name, u.last_name,
                    GROUP_CONCAT(
                        CONCAT(p.name, '||', oi.quantity, '||', oi.price)
                        SEPARATOR ';;'
                    ) as items
             FROM orders o
             JOIN customers u ON o.customer_id = u.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE o.id = ? AND o.customer_id = ?
             GROUP BY o.id`,
            [orderId, userId]
        );

        if (rows.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        const order = rows[0];
        const items = order.items ? order.items.split(';;').map((item: string) => {
            const [name, qty, price] = item.split('||');
            return { name, quantity: qty, price };
        }) : [];

        const settings = await getStoreSettings();

        // Default Fallbacks if settings are missing
        const storeName = settings['store_name'] || settings['site_name'] || 'YEM KAF';
        const storeAddress = settings['store_address'] || '123 Avenue des Champs-Élysées\n75008 Paris, France';
        const vatNumber = settings['vat_number'] || 'FR 12 345678900';
        const storeEmail = settings['store_email'] || 'contact@yemenimarket.com';
        const storePhone = settings['store_phone'] || '+33 1 23 45 67 89';
        const prefix = settings['invoice_prefix'] || `INV-${new Date().getFullYear()}-`;

        // Format address breaks
        const formattedStoreAddress = storeAddress.replace(/\n/g, '<br>');

        // Parse user address
        let address = { address: '', city: '', zip: '', country: '' };
        try {
            address = JSON.parse(order.shipping_address);
        } catch { }

        // Generate HTML Invoice
        const html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Facture #${order.id}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; line-height: 1.5; }
                    .header-container { display: flex; justify-content: space-between; border-bottom: 2px solid #f0f0f0; padding-bottom: 30px; margin-bottom: 40px; }
                    .logo-section h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
                    .logo-section p { margin: 5px 0 0; color: #666; font-size: 14px; }
                    .invoice-meta { text-align: right; }
                    .invoice-meta h2 { margin: 0 0 10px; font-size: 24px; color: #cfb160; text-transform: uppercase; letter-spacing: 2px; }
                    .meta-item { font-size: 14px; color: #555; }
                    .meta-item strong { color: #111; }
                    
                    .addresses-container { display: flex; justify-content: space-between; margin-bottom: 50px; gap: 40px; }
                    .address-box { flex: 1; }
                    .address-box h3 { font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    .address-box p { font-size: 14px; color: #444; margin: 0; line-height: 1.6; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; table-layout: fixed; }
                    th { text-align: left; padding: 15px 10px; background-color: #f9f9f9; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 2px solid #eee; }
                    td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
                    .text-right { text-align: right; }
                    .col-desc { width: 50%; }
                    .col-qty { width: 15%; text-align: center; }
                    .col-price { width: 15%; text-align: right; }
                    .col-total { width: 20%; text-align: right; }
                    
                    .totals-section { display: flex; justify-content: flex-end; }
                    .totals-box { width: 300px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666; }
                    .total-row.final { border-bottom: none; border-top: 2px solid #cfb160; padding-top: 15px; margin-top: 5px; font-size: 18px; font-weight: bold; color: #111; }
                    
                    .footer { margin-top: 80px; padding-top: 30px; border-top: 1px solid #f0f0f0; text-align: center; color: #999; font-size: 11px; line-height: 1.6; }
                    .footer strong { color: #666; }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="logo-section">
                        <h1>${storeName}</h1>
                        <p>${storeEmail} • ${storePhone}</p>
                    </div>
                    <div class="invoice-meta">
                        <h2>Facture</h2>
                        <div class="meta-item"><strong>Numéro:</strong> ${prefix}${order.id.toString().padStart(4, '0')}</div>
                        <div class="meta-item"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div class="meta-item"><strong>Statut:</strong> Payée</div>
                    </div>
                </div>

                <div class="addresses-container">
                    <div class="address-box">
                        <h3>Vendeur</h3>
                        <p>
                            <strong>${storeName}</strong><br>
                            ${formattedStoreAddress}<br>
                            ${vatNumber ? `TVA Intra: ${vatNumber}` : ''}
                        </p>
                    </div>
                    <div class="address-box" style="text-align: right;">
                        <h3>Client (Facturation & Livraison)</h3>
                        <p>
                            <strong>${order.first_name || ''} ${order.last_name || ''}</strong><br>
                            ${address.address || ''}<br>
                            ${address.zip || ''} ${address.city || ''}<br>
                            ${address.country || ''}<br>
                            ${order.email || ''}
                        </p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="col-desc">Description</th>
                            <th class="col-qty">Quantité</th>
                            <th class="col-price">Prix Unit.</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item: { name: string; quantity: string; price: string }) => `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong>
                                </td>
                                <td class="col-qty">${item.quantity}</td>
                                <td class="col-price">${Number(item.price).toFixed(2)} €</td>
                                <td class="col-total">${(Number(item.price) * Number(item.quantity)).toFixed(2)} €</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-section">
                    <div class="totals-box">
                        <div class="total-row">
                            <span>Total HT</span>
                            <span>${(Number(order.total_amount) / 1.2).toFixed(2)} €</span>
                        </div>
                        <div class="total-row">
                            <span>TVA (20%)</span>
                            <span>${(Number(order.total_amount) - (Number(order.total_amount) / 1.2)).toFixed(2)} €</span>
                        </div>
                        <div class="total-row">
                            <span>Livraison</span>
                            <span>0.00 €</span>
                        </div>
                        <div class="total-row final">
                            <span>Total TTC</span>
                            <span>${Number(order.total_amount).toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>
                        <strong>${storeName}</strong> — ${formattedStoreAddress.replace(/<br>/g, ', ')}<br>
                        ${vatNumber ? `N° TVA: ${vatNumber} — ` : ''}Merci de votre confiance.
                    </p>
                    <p>En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée (Article L441-6 du code de commerce).</p>
                </div>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return NextResponse.json({ error: 'Failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
