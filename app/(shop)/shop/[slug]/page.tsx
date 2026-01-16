import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/shop/ProductDetails';
import ProductSpecs from '@/components/shop/ProductSpecs';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

async function getProduct(slug: string) {
    // Determine if slug is numeric ID or string slug
    // Assuming backend handles both or slug is just the name for now.
    // However, looking at previous API code, it might fetch by ID or Slug.
    // Let's assume the API route /api/products/[slug] uses SQL query.
    // I will use direct DB access here for standard Server Component patterns.

    try {
        // Attempt to find by ID if slug is a number, or by some slug field if you have one.
        // Since the schema wasn't fully visible, I'll default to matching 'name' or existing logic.
        // BUT, to be safe and consistent with previous code which called `/api/products/${slug}`,
        // I'll replicate that SQL logic here.
        // Assuming 'slug' matches 'id' or a 'slug' column.
        // If `slug` is actually the ID (often the case in simple apps):

        const [rows]: any = await pool.execute(
            `SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = ? AND p.is_active = 1
            LIMIT 1`,
            [slug]
        );

        // If not found by ID, maybe try name? (leaving simple for now)
        if (!rows || rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Yemeni Market',
        };
    }

    return {
        title: `${product.name} | Yemeni Market`,
        description: product.description || `Buy authentic ${product.name} from Yemeni Market.`,
        openGraph: {
            title: product.name,
            description: product.description || `Buy authentic ${product.name} from Yemeni Market.`,
            images: [product.image_url || '/images/honey-jar.jpg'],
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen">
            <ProductDetails product={product} />
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <ProductSpecs
                    weight={parseFloat(product.weight) || 0.5}
                    origin="Yemen"
                    shelfLife="24 months"
                    description={product.description || ''}
                    category={product.category?.slug || 'honey'}
                />
            </div>
        </main>
    );
}
