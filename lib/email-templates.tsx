import * as React from 'react';

// Styles for the email
const mainStyle = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
};

const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    border: '1px solid #e5e5e5',
    backgroundColor: '#ffffff',
};

const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '40px',
};

const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    textDecoration: 'none',
    letterSpacing: '2px',
};

const contentStyle = {
    marginBottom: '40px',
    lineHeight: '1.6',
    color: '#444444',
};

const headingStyle = {
    fontSize: '24px',
    fontWeight: '300',
    color: '#000000',
    marginBottom: '20px',
    textAlign: 'center' as const,
};

const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0 auto',
    display: 'block',
    width: 'fit-content',
};

const footerStyle = {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#888888',
    marginTop: '40px',
    borderTop: '1px solid #e5e5e5',
    paddingTop: '20px',
};

export const WelcomeTemplate = () => (
    <div style={mainStyle}>
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={logoStyle}>YEMENI MARKET</div>
            </div>

            <div style={contentStyle}>
                <h1 style={headingStyle}>Bienvenue dans l&apos;Excellence</h1>
                <p>Cher client,</p>
                <p>
                    Merci de vous être inscrit à notre newsletter. Nous sommes ravis de vous accueillir dans notre communauté dédiée à l&apos;authenticité et au luxe yéménite.
                </p>
                <p>
                    Vous serez désormais le premier informé de nos nouvelles collections, de nos offres exclusives et de l&apos;histoire derrière nos produits d&apos;exception.
                </p>
                <p>
                    Pour commencer votre voyage, découvrez notre collection &quot;Héritage&quot;.
                </p>

                <div style={{ margin: '30px 0' }}>
                    <a href="https://yemeni-market.com/shop" style={buttonStyle}>
                        DÉCOUVRIR LA COLLECTION
                    </a>
                </div>

                <p style={{ fontSize: '14px', fontStyle: 'italic', textAlign: 'center' }}>
                    &quot;L&apos;authenticité n&apos;est pas un luxe, c&apos;est une promesse.&quot;
                </p>
            </div>

            <div style={footerStyle}>
                <p>© 2026 Yemeni Market. Tous droits réservés.</p>
                <p>
                    <a href="https://yemeni-market.com/unsubscribe" style={{ color: '#888888', textDecoration: 'underline' }}>
                        Se désinscrire
                    </a>
                </p>
            </div>
        </div>
    </div>
);

interface OrderItem {
    title: string;
    quantity: number;
    price: number;
}

interface OrderEmailProps {
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    shippingAddress: string;
}

export const OrderConfirmationTemplate = ({
    orderNumber,
    customerName,
    items,
    total,
    shippingAddress,
}: OrderEmailProps) => (
    <div style={mainStyle}>
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={logoStyle}>YEMENI MARKET</div>
            </div>

            <div style={contentStyle}>
                <h1 style={headingStyle}>Confirmation de Commande</h1>
                <p>Bonjour {customerName},</p>
                <p>Nous vous remercions pour votre commande. Nous la préparons avec le plus grand soin.</p>

                <div style={{ background: '#f9f9f9', padding: '20px', marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                        COMMANDE #{orderNumber}
                    </p>
                    {items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <span>{item.quantity}x {item.title}</span>
                            <span>{(item.price).toFixed(2)}€</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontWeight: 'bold', paddingTop: '15px', borderTop: '2px solid #000' }}>
                        <span>TOTAL</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Adresse de livraison :</p>
                    <p style={{ whiteSpace: 'pre-wrap', color: '#666' }}>{shippingAddress}</p>
                </div>

                <div style={{ margin: '30px 0' }}>
                    <a href={`https://yemeni-market.com/orders/${orderNumber}`} style={buttonStyle}>
                        SUIVRE MA COMMANDE
                    </a>
                </div>
            </div>

            <div style={footerStyle}>
                <p>Si vous avez des questions, répondez simplement à cet email.</p>
                <p>© 2026 Yemeni Market. Tous droits réservés.</p>
            </div>
        </div>
    </div>
);

export const ContactEmailTemplate = ({ name, email, message, phone, subject }: { name: string, email: string, message: string, phone?: string, subject: string }) => (
    <div style={mainStyle}>
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={logoStyle}>NOUVEAU MESSAGE</div>
            </div>
            <div style={contentStyle}>
                <p><strong>De:</strong> {name} ({email})</p>
                {phone && <p><strong>Téléphone:</strong> {phone}</p>}
                <p><strong>Sujet:</strong> {subject}</p>
                <div style={{ background: '#f9f9f9', padding: '20px', borderLeft: '3px solid #000', marginTop: '20px' }}>
                    {message.split('\n').map((line, i) => <p key={i} style={{ margin: '5px 0' }}>{line}</p>)}
                </div>
            </div>
        </div>
    </div>
);
