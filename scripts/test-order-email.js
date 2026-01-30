const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Parse DATABASE_URL
const dbUrl = envConfig.DATABASE_URL;
if (!dbUrl) process.exit(1);

// Parse DATABASE_URL using URL class for robustness
let user, password, host, port, database;
try {
    const dbUri = new URL(dbUrl);
    user = dbUri.username;
    password = decodeURIComponent(dbUri.password);
    host = dbUri.hostname;
    port = dbUri.port;
    database = dbUri.pathname.substring(1);
} catch (e) {
    process.exit(1);
}

// MOCK DATA for the email
const mockData = {
    orderNumber: `ORD-${Date.now()}-TEST`,
    customerName: "Al Basha Trading",
    customerEmail: process.argv[2] || "albashatrading69@gmail.com",
    items: [
        { title: "Royal Sidr Honey (Winter Harvest)", quantity: 2, price: 89.00 },
        { title: "Organic Yemeni Coffee Beans", quantity: 1, price: 35.00 },
        { title: "Traditional Silver Dagger (Janbiya)", quantity: 1, price: 450.00 }
    ],
    subtotal: 663.00,
    shipping: 0.00,
    total: 663.00,
    shippingAddress: "123 Business St\nFloor 4, Suite 10\nParis, 75001\nFrance",
    paymentMethod: "Credit Card (Stripe)"
};

async function sendTestOrderEmail() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host, user, password, database, port: parseInt(port)
        });

        // 1. Fetch Config
        const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email', 'smtp_from_name'];
        const config = {};

        for (const key of keys) {
            const [rows] = await connection.execute(
                'SELECT value FROM store_config WHERE `key` = ? LIMIT 1',
                [key]
            );
            if (rows.length > 0) {
                config[key] = rows[0].value ? rows[0].value.trim() : '';
            }
        }

        console.log(`📧 Sending Mock Order Email to: ${mockData.customerEmail}`);

        // 2. Create Transporter
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: Number(config.smtp_port) || 587,
            secure: Number(config.smtp_port) === 465,
            auth: {
                user: config.smtp_user,
                pass: config.smtp_password,
            },
        });

        // 3. Construct HTML (Copied logic from lib/email.ts)
        const itemsHtml = mockData.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} €</td>
          </tr>
        `).join('');

        const htmlContent = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
            <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">YEMEN KAF</h1>
              <p style="color: #888; margin: 5px 0 0; font-size: 12px;">PRODUITS YÉMÉNITES DE LUXE</p>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #1a1a1a; margin-top: 0;">Confirmation de Commande</h2>
              <p>Bonjour ${mockData.customerName},</p>
              <p>Merci d'avoir choisi Yemen Kaf. Votre commande <strong>#${mockData.orderNumber}</strong> a été bien reçue.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background-color: #f9f9f9;">
                    <th style="padding: 8px; text-align: left;">Article</th>
                    <th style="padding: 8px; text-align: center;">Qté</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 8px; text-align: right;">Sous-total :</td>
                    <td style="padding: 8px; text-align: right;">${mockData.subtotal.toFixed(2)} €</td>
                  </tr>
                   <tr>
                    <td colspan="2" style="padding: 8px; text-align: right;">Livraison :</td>
                    <td style="padding: 8px; text-align: right;">${mockData.shipping.toFixed(2)} €</td>
                  </tr>
                  <tr style="font-weight: bold; font-size: 16px;">
                    <td colspan="2" style="padding: 8px; text-align: right;">Total :</td>
                    <td style="padding: 8px; text-align: right; color: #D4AF37;">${mockData.total.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>

              <div style="margin-top: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold;">Adresse de Livraison :</p>
                <p style="margin: 5px 0 0; white-space: pre-line;">${mockData.shippingAddress}</p>
                <p style="margin-top: 10px;"><strong>Mode de Paiement :</strong> ${mockData.paymentMethod}</p>
              </div>
            </div>

            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              <p>&copy; ${new Date().getFullYear()} Yemen Kaf. Tous droits réservés.</p>
            </div>
          </div>
        `;

        // 4. Send Email
        const info = await transporter.sendMail({
            from: `"${config.smtp_from_name || 'Yemen Kaf'}" <${config.smtp_from_email}>`,
            to: mockData.customerEmail,
            subject: `Order Confirmation #${mockData.orderNumber}`,
            text: `Your mock order #${mockData.orderNumber} is confirmed.`,
            html: htmlContent,
        });

        console.log('✅ Mock Order Email sent successfully!');
        console.log('   Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Failed to send mock email:', error);
    } finally {
        if (connection) await connection.end();
    }
}

sendTestOrderEmail();
