import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create Categories
    const honeyCategory = await prisma.category.upsert({
        where: { slug: 'yemeni-honey' },
        update: {},
        create: {
            name: 'Yemeni Honey',
            slug: 'yemeni-honey',
            description: 'Authentic Sidr and Sumur honey from the mountains of Yemen.',
            imageUrl: '/images/honey-category.jpg',
            isActive: true,
            displayOrder: 1,
        },
    })

    const coffeeCategory = await prisma.category.upsert({
        where: { slug: 'yemeni-coffee' },
        update: {},
        create: {
            name: 'Yemeni Coffee',
            slug: 'yemeni-coffee',
            description: 'World-renowned coffee beans from the highlands.',
            imageUrl: '/images/coffee-category.jpg',
            isActive: true,
            displayOrder: 2,
        },
    })

    const spicesCategory = await prisma.category.upsert({
        where: { slug: 'spices' },
        update: {},
        create: {
            name: 'Spices & Herbs',
            slug: 'spices',
            description: 'Traditional Yemeni spice blends and herbs.',
            imageUrl: '/images/spices-category.jpg',
            isActive: true,
            displayOrder: 3,
        },
    })

    // 2. Create Products
    // Honey Products
    await prisma.product.upsert({
        where: { slug: 'royal-sidr-honey' },
        update: {},
        create: {
            categoryId: honeyCategory.id,
            name: 'Royal Sidr Honey (Do\'an)',
            slug: 'royal-sidr-honey',
            description: 'Premium grade Sidr honey from the Do\'an valley. Known for its rich medicinal properties.',
            price: 120.00,
            stockQuantity: 50,
            weight: 0.5,
            images: '["/images/sidr-honey.jpg"]',
            isActive: true,
            isFeatured: true,
        },
    })

    await prisma.product.upsert({
        where: { slug: 'sumur-honey' },
        update: {},
        create: {
            categoryId: honeyCategory.id,
            name: 'Sumur (Acacia) Honey',
            slug: 'sumur-honey',
            description: 'Dark, rich honey from the Acacia tree. Excellent for respiratory health.',
            price: 85.00,
            stockQuantity: 30,
            weight: 0.5,
            images: '["/images/sumur-honey.jpg"]',
            isActive: true,
            isFeatured: false,
        },
    })

    // Coffee Products
    await prisma.product.upsert({
        where: { slug: 'ibini-coffee' },
        update: {},
        create: {
            categoryId: coffeeCategory.id,
            name: 'Ibini Classic Coffee',
            slug: 'ibini-coffee',
            description: 'Traditional Yemeni coffee with a distinct chocolatey undertone.',
            price: 35.00,
            stockQuantity: 100,
            weight: 0.25,
            images: '["/images/coffee-beans.jpg"]',
            isActive: true,
            isFeatured: true,
        },
    })

    // Spice Products
    await prisma.product.upsert({
        where: { slug: 'hawaij-spice-mix' },
        update: {},
        create: {
            categoryId: spicesCategory.id,
            name: 'Hawaij Spice Mix',
            slug: 'hawaij-spice-mix',
            description: 'Essential Yemeni spice blend for coffee and soups.',
            price: 15.00,
            stockQuantity: 200,
            weight: 0.1,
            images: '["/images/hawaij.jpg"]',
            isActive: true,
            isFeatured: false,
        },
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
