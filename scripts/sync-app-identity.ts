import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function sync() {
    console.log('🔄 Syncing Web Identity to Mobile App...');

    // 1. Get Web Configs
    const webConfigs = await prisma.storeConfig.findMany({
        where: {
            key: {
                in: ['logo_url', 'primary_color', 'support_phone', 'support_email', 'app_splash_url', 'app_banner_honey_url', 'app_banner_coffee_url']
            }
        }
    });

    const webMap = webConfigs.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    // 2. Prepare App Configs
    const identity = {
        logoUrl: webMap.logo_url || '/images/logo.png',
        primaryColor: webMap.primary_color || '#cfb160',
        splashUrl: webMap.app_splash_url || '/images/splash_bg.png'
    };

    const contact = {
        whatsapp: webMap.support_phone || '',
        email: webMap.support_email || ''
    };

    const banners = [
        { id: 1, placement: 'home', imageUrl: webMap.app_banner_honey_url || '/images/banner_honey.png', action: 'category', target: 'honey' },
        { id: 2, placement: 'home', imageUrl: webMap.app_banner_coffee_url || '/images/banner_coffee.png', action: 'category', target: 'coffee' }
    ];

    // 3. Upsert into app_configs
    const appUpdates = [
        { key: 'app_identity', value: JSON.stringify(identity) },
        { key: 'contact_info', value: JSON.stringify(contact) },
        { key: 'app_banners', value: JSON.stringify(banners) }
    ];

    for (const update of appUpdates) {
        await prisma.$executeRawUnsafe(
            `INSERT INTO app_configs (\`key\`, \`value\`, \`updated_at\`, \`created_at\`) 
             VALUES (?, ?, NOW(), NOW()) 
             ON DUPLICATE KEY UPDATE \`value\` = ?, \`updated_at\` = NOW()`,
            update.key, update.value, update.value
        );
    }

    console.log('✅ Identity, Contact and Banners synchronized successfully!');
}

sync()
    .catch(e => console.error('❌ Sync failed:', e))
    .finally(() => prisma.$disconnect());
