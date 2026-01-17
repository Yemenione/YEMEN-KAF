
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { key: 'site_name', value: 'Yemeni Market', group: 'general' },
    { key: 'site_description', value: 'Premium Yemeni Products', group: 'general' },
    { key: 'support_email', value: 'support@yemeni-market.com', group: 'contact' },
    { key: 'support_phone', value: '+33 6 12 34 56 78', group: 'contact' },
    { key: 'logo_url', value: '/images/logo.png', group: 'theme', type: 'image' },
    { key: 'primary_color', value: '#cfb160', group: 'theme', type: 'color' },
    { key: 'social_facebook', value: 'https://facebook.com', group: 'social' },
    { key: 'social_instagram', value: 'https://instagram.com', group: 'social' },
  ];

  console.log('Seeding Store Config...');

  for (const item of defaults) {
    await prisma.storeConfig.upsert({
      where: { key: item.key },
      update: {},
      create: {
        key: item.key,
        value: item.value,
        group: item.group,
        type: item.type || 'text',
        isPublic: true
      }
    });
  }

  console.log('Store Config seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
