import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yemeni-market.com';

    // 1. Static Pages
    const staticPages = [
        '',
        '/shop',
        '/blog',
        '/our-story',
        '/the-farms',
        '/contact',
        '/track-order',
        '/shipping-policy',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Products (from DB)
    let productUrls: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        });

        productUrls = products.map((product) => ({
            url: `${baseUrl}/shop/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.9,
        }));
    } catch (error) {
        console.warn('Sitemap: Failed to fetch products', error);
    }

    // 3. Categories (from DB - mapped to Shop filter)
    let categoryUrls: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        categoryUrls = categories.map((category) => ({
            url: `${baseUrl}/shop?category=${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch (error) {
        console.warn('Sitemap: Failed to fetch categories', error);
    }

    // 4. Blog Posts (Hardcoded based on current implementation)
    const blogSlugs = [
        'honey-health-benefits',
        'authentic-incense-guide',
        'yemeni-coffee-history',
        'honey-recipes',
        'incense-mental-health',
        'coffee-brewing-guide',
    ];

    const blogUrls = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...staticPages, ...productUrls, ...categoryUrls, ...blogUrls];
}
