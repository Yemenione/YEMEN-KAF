import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/shop/ProductDetails';
import ProductSpecs from '@/components/shop/ProductSpecs';
import ProductCarousel from '@/components/shop/ProductCarousel';
import { prisma } from '@/lib/prisma';

async function getProduct(slug: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { slug, isActive: true },
            include: {
                category: true,
                variants: {
                    include: {
                        attributeValues: {
                            include: {
                                attributeValue: {
                                    include: {
                                        attribute: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!product) return null;

        // Map Prisma product to the shape expected by components
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku || '',
            price: Number(product.price),
            compare_at_price: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stock_quantity: product.stockQuantity || 0,
            images: product.images,
            image_url: Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : product.images),
            category_name: product.category?.name || 'Uncategorized',
            description: product.description || '',
            weight: product.weight ? Number(product.weight) : 0.5,
            width: product.width ? Number(product.width) : null,
            height: product.height ? Number(product.height) : null,
            depth: product.depth ? Number(product.depth) : null,
            costPrice: product.costPrice ? Number(product.costPrice) : null,
            ecotax: product.ecotax ? Number(product.ecotax) : null,
            origin_country: "Yemen",
            taxRate: 0,
            category_slug: product.category?.slug,
            categoryId: product.category?.id,
            variants: product.variants.map(v => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stock: v.stock,
                images: v.images,
                attributes: v.attributeValues.map(av => ({
                    id: av.id,
                    attributeId: av.attributeValue.attributeId,
                    value: av.attributeValue.name,
                    name: av.attributeValue.attribute.name
                }))
            }))
        };
    } catch (error) {
        console.error("Error fetching product from Prisma:", error);
        return null;
    }
}

async function getRelatedProducts(categoryId: number | null, currentId: number) {
    if (!categoryId) return [];
    const products = await prisma.product.findMany({
        where: { categoryId, id: { not: currentId }, isActive: true },
        take: 8,
        include: { category: true }
    });
    return products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compare_at_price: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        images: p.images,
        category_name: p.category?.name,
        category_slug: p.category?.slug
    }));
}

async function getNewArrivals() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true }
    });
    return products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compare_at_price: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        images: p.images,
        category_name: p.category?.name,
        category_slug: p.category?.slug
    }));
}

async function getCarriers() {
    try {
        return await prisma.carrier.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching carriers:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return { title: 'Product Not Found | Yemeni Market' };
    }

    let imageUrl = '/images/honey-jar.jpg';
    if (product.images) {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
        } catch { }
    }

    return {
        title: `${product.name} | Yemeni Market`,
        description: product.description || `Buy authentic ${product.name} from Yemeni Market.`,
        openGraph: {
            title: product.name,
            description: product.description || `Buy authentic ${product.name} from Yemeni Market.`,
            images: [imageUrl],
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    // Since we spread ...rest in getProduct, we need to ensure the types match what components expect.
    // The components ProductDetails, ProductSpecs, etc. likely take specific interfaces.
    // We should cast 'product' to the expected interface or ensure getProduct returns strict types.
    // For now, let's fix the obvious 'any' casts by trusting the returned structure from strict getProduct.

    const [relatedProducts, newArrivals, carriers] = await Promise.all([
        getRelatedProducts(product.categoryId ?? null, product.id),
        getNewArrivals(),
        getCarriers()
    ]);

    return (
        <main className="min-h-screen">
            <ProductDetails product={product} carriers={carriers} />
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <ProductSpecs
                    weight={product.weight || 0.5}
                    origin={product.origin_country || "Yemen"}
                    shelfLife="24 months"
                    description={product.description || ''}
                    category={product.category_slug || 'honey'}
                />
                <ProductCarousel title="Produits Similaires" products={relatedProducts} />
                <ProductCarousel title="Nouveautés" products={newArrivals} />
            </div>
        </main>
    );
}
