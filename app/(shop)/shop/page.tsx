import { getFeaturedCategories } from "@/app/actions/categories";
import { getProducts } from "@/app/actions/products";
import ShopClient from "./ShopClient";

// Enable ISR for the shop page
export const revalidate = 300; // 5 minutes

export default async function ShopPage() {
    // Initial data fetch on server for faster first paint and SEO
    const [categories, initialProducts] = await Promise.all([
        getFeaturedCategories(),
        getProducts(20)
    ]);

    // Format products to match client expectation
    const formattedProducts = initialProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        regular_price: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        slug: p.slug,
        images: p.images || undefined,
        category_name: p.category?.name || 'Collection',
        category_slug: p.category?.slug || 'all',
        translations: p.translations ? JSON.parse(p.translations as string) : null,
        category_translations: p.category?.translations ? JSON.parse(p.category?.translations as string) : null
    }));

    return <ShopClient initialProducts={formattedProducts} initialCategories={categories} />;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}
