import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
const createTransporter = async () => {
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

    // Construct HTML Items Table
    const itemsHtml = data.items.map(item => `
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
          <p style="color: #888; margin: 5px 0 0; font-size: 12px;">LUXURY YEMENI PRODUCTS</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Order Confirmed</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for choosing Yemen Kaf. Your order <strong>#${data.orderNumber}</strong> has been received.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;">Subtotal:</td>
                <td style="padding: 8px; text-align: right;">${data.subtotal.toFixed(2)} €</td>
              </tr>
               <tr>
                <td colspan="2" style="padding: 8px; text-align: right;">Shipping:</td>
                <td style="padding: 8px; text-align: right;">${data.shipping.toFixed(2)} €</td>
              </tr>
              <tr style="font-weight: bold; font-size: 16px;">
                <td colspan="2" style="padding: 8px; text-align: right;">Total:</td>
                <td style="padding: 8px; text-align: right; color: #D4AF37;">${data.total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold;">Shipping Address:</p>
            <p style="margin: 5px 0 0; white-space: pre-line;">${data.shippingAddress}</p>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          <p>&copy; ${new Date().getFullYear()} Yemen Kaf. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Yemen Kaf Support" <support@yemenkaf.com>',
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber}`,
      text: `Your order #${data.orderNumber} is confirmed. Total: ${data.total} €`,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

export const sendEmail = async (data: { to: string; subject: string; html: string; text?: string }) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"Yemen Kaf Support" <support@yemenkaf.com>',
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
