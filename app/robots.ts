import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yemeni-market.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin-portal/', '/account/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
