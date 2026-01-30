import nodemailer from 'nodemailer';

import { getStoreConfig, getSecretConfig } from './config';

// Create a reusable transporter object using the default SMTP transport
const createTransporter = async () => {
  const host = await getStoreConfig('smtp_host');
  const port = await getStoreConfig('smtp_port');
  const user = await getStoreConfig('smtp_user');
  const pass = await getSecretConfig('smtp_password');

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  console.warn("⚠️ No SMTP config found, falling back to Ethereal test account.");

  // Generate test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

// Define interface for the data passed from route.ts
interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}

export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  try {
    const transporter = await createTransporter();

    // Construct HTML Items Table (French)
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} €</td>
      </tr>
    `).join('');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yemenimarket.fr';
    const logoUrlRaw = await getStoreConfig('logo_url');
    const logoUrl = logoUrlRaw
      ? (logoUrlRaw.startsWith('http') ? logoUrlRaw : `${siteUrl}${logoUrlRaw}`)
      : `${siteUrl}/images/logo.png`;
    const siteName = await getStoreConfig('site_name') || 'Yemen Kaf';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
        <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
          <a href="${siteUrl}">
            <img src="${logoUrl}" alt="${siteName}" style="max-height: 80px; width: auto; margin-bottom: 10px;" />
          </a>
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">${siteName}</h1>
          <p style="color: #888; margin: 5px 0 0; font-size: 11px; letter-spacing: 3px;">AUTHENTIC YEMENI HERITAGE</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #1a1a1a; margin-top: 0; text-align: center; font-size: 20px;">Confirmation de Commande</h2>
          <p>Bonjour <strong>${data.customerName}</strong>,</p>
          <p>Merci pour votre confiance. Votre commande <strong>#${data.orderNumber}</strong> est confirmée et en cours de traitement.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
            <thead>
              <tr style="background-color: #fcfcfc; border-bottom: 2px solid #f0f0f0;">
                <th style="padding: 12px 8px; text-align: left; font-size: 13px; text-transform: uppercase; color: #666;">Article</th>
                <th style="padding: 12px 8px; text-align: center; font-size: 13px; text-transform: uppercase; color: #666;">Qté</th>
                <th style="padding: 12px 8px; text-align: right; font-size: 13px; text-transform: uppercase; color: #666;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 20px 8px 8px; text-align: right; color: #666;">Sous-total :</td>
                <td style="padding: 20px 8px 8px; text-align: right;">${data.subtotal.toFixed(2)} €</td>
              </tr>
               <tr>
                <td colspan="2" style="padding: 8px; text-align: right; color: #666;">Livraison :</td>
                <td style="padding: 8px; text-align: right;">${data.shipping.toFixed(2)} €</td>
              </tr>
              <tr style="font-weight: bold; font-size: 18px;">
                <td colspan="2" style="padding: 15px 8px; text-align: right; border-top: 1px solid #eee;">Total :</td>
                <td style="padding: 15px 8px; text-align: right; color: #D4AF37; border-top: 1px solid #eee;">${data.total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 35px; background-color: #fcfcfc; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
            <p style="margin: 0 0 10px; font-weight: bold; color: #1a1a1a; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Information de Livraison</p>
            <p style="margin: 5px 0 0; white-space: pre-line; line-height: 1.5; color: #555;">${data.shippingAddress}</p>
            <p style="margin-top: 15px; font-size: 13px;"><strong>Mode de Paiement :</strong> ${data.paymentMethod}</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${siteUrl}/order-confirmation/${data.orderNumber}" style="display: inline-block; padding: 14px 28px; background-color: #1a1a1a; color: #D4AF37; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Suivre ma commande</a>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
          <div style="margin-bottom: 15px;">
            <a href="${siteUrl}" style="color: #666; text-decoration: none; margin: 0 10px;">Boutique</a> | 
            <a href="${siteUrl}/contact" style="color: #666; text-decoration: none; margin: 0 10px;">Contact</a> | 
            <a href="${siteUrl}/privacy-policy" style="color: #666; text-decoration: none; margin: 0 10px;">Confidentialité</a>
          </div>
          <p>&copy; ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
          <p style="margin-top: 10px; color: #aaa;">Merci d'apprécier l'excellence yéménite avec nous.</p>
        </div>
      </div>
    `;

    const fromEmail = await getStoreConfig('smtp_from_email') || 'support@yemenkaf.com';
    const fromName = await getStoreConfig('smtp_from_name') || 'Yemen Kaf Support';
    const storeEmail = await getStoreConfig('store_email') || fromEmail;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.customerEmail,
      bcc: storeEmail, // Send copy to Admin
      subject: `Order Confirmation #${data.orderNumber}`,
      text: `Your order #${data.orderNumber} is confirmed. Total: ${data.total} €`,
      html: htmlContent,
    });

    console.log("✅ Order Email sent. MessageId: %s", info.messageId);
    console.log("   👉 Accepted: %s", info.accepted);
    console.log("   👉 Rejected: %s", info.rejected);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return null;
  }
};

export const sendEmail = async (data: { to: string; subject: string; html: string; text?: string }) => {
  try {
    const transporter = await createTransporter();

    const fromEmail = await getStoreConfig('smtp_from_email') || 'support@yemenkaf.com';
    const fromName = await getStoreConfig('smtp_from_name') || 'Yemen Kaf Support';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.to,
      subject: data.subject,
      text: data.text || 'Yemen Kaf Test Email',
      html: data.html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending generic email:", error);
    throw error;
  }
};

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (data: ContactEmailData) => {
  try {
    const transporter = await createTransporter();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yemenimarket.fr';
    const logoUrlRaw = await getStoreConfig('logo_url');
    const logoUrl = logoUrlRaw
      ? (logoUrlRaw.startsWith('http') ? logoUrlRaw : `${siteUrl}${logoUrlRaw}`)
      : `${siteUrl}/images/logo.png`;
    const siteName = await getStoreConfig('site_name') || 'Yemen Kaf';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <img src="${logoUrl}" alt="${siteName}" style="max-height: 60px; width: auto; margin-bottom: 10px;" />
          <h1 style="color: #D4AF37; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">${siteName}</h1>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Nouveau Message de Contact</h2>
          
          <div style="background-color: #fcfcfc; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #f0f0f0;">
            <p style="margin: 0 0 8px;"><strong>Expéditeur :</strong> ${data.name}</p>
            <p style="margin: 0 0 8px;"><strong>Email :</strong> <a href="mailto:${data.email}" style="color: #D4AF37; text-decoration: none;">${data.email}</a></p>
            ${data.phone ? `<p style="margin: 0 0 8px;"><strong>Téléphone :</strong> ${data.phone}</p>` : ''}
            <p style="margin: 0;"><strong>Sujet :</strong> ${data.subject}</p>
          </div>

          <div style="margin-top: 25px;">
            <p style="font-weight: bold; color: #666; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Message :</p>
            <div style="white-space: pre-wrap; background-color: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; line-height: 1.6; color: #444;">${data.message}</div>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 11px; color: #888;">
          <p>Ce message a été envoyé via le formulaire de contact du site <a href="${siteUrl}" style="color: #888;">${siteUrl.replace('https://', '')}</a>.</p>
        </div>
      </div>
    `;

    const fromEmail = await getStoreConfig('smtp_from_email') || 'support@yemenkaf.com';
    // const fromName = await getStoreConfig('smtp_from_name') || 'Yemen Kaf';

    const info = await transporter.sendMail({
      from: `"${data.name}" <${fromEmail}>`, // Send "on behalf of" customer
      replyTo: data.email,
      to: fromEmail,
      subject: `[Contact] ${data.subject}`,
      text: `Nouveau message de ${data.name} (${data.email}):\n\n${data.message}`,
      html: htmlContent,
    });

    console.log("Contact email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (email: string) => {
  try {
    const transporter = await createTransporter();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yemenimarket.fr';
    const logoUrlRaw = await getStoreConfig('logo_url');
    const logoUrl = logoUrlRaw
      ? (logoUrlRaw.startsWith('http') ? logoUrlRaw : `${siteUrl}${logoUrlRaw}`)
      : `${siteUrl}/images/logo.png`;
    const siteName = await getStoreConfig('site_name') || 'Yemen Kaf';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
        <div style="background-color: #1a1a1a; padding: 40px; text-align: center;">
          <img src="${logoUrl}" alt="${siteName}" style="max-height: 100px; width: auto; margin-bottom: 20px;" />
          <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">WELCOME TO ${siteName}</h1>
          <p style="color: #888; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">THE ESSENCE OF YEMENI HERITAGE</p>
        </div>
        
        <div style="padding: 40px; text-align: center; background-color: #fff;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Thank you for joining our community!</h2>
          <p style="line-height: 1.6; color: #555; font-size: 16px;">We are delighted to have you with us. From now on, you will be the first to know about our premium Sidr Honey harvests, exclusive organic coffee batches, and traditional Yemeni treasures.</p>
          
          <div style="margin: 40px 0;">
            <a href="${siteUrl}" style="background-color: #D4AF37; color: #fff; padding: 18px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">EXPLORE OUR COLLECTION</a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 40px;">If you have any questions, simply reply to this email. Our concierge team is here to assist you.</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee;">
          <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          <p style="text-transform: uppercase; letter-spacing: 1px; font-size: 10px;">Luxury Yemeni Gourmet & Traditional Arts</p>
        </div>
      </div>
    `;

    const fromEmail = await getStoreConfig('smtp_from_email') || 'support@yemenkaf.com';
    const fromName = await getStoreConfig('smtp_from_name') || 'Yemen Kaf';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Welcome to Yemen Kaf - The Essence of Yemeni Heritage',
      text: 'Welcome to Yemen Kaf! Thank you for joining our newsletter.',
      html: htmlContent,
    });

    console.log("Welcome email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};
