import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/shop/ProductDetails';
import ProductSpecs from '@/components/shop/ProductSpecs';
import ProductCarousel from '@/components/shop/ProductCarousel';
import { prisma } from '@/lib/prisma';

async function getProduct(slug: string) {
    try {
        const product = await prisma.product.findFirst({
            where: {
                slug: slug,
                isActive: true
            },
            include: {
                category: true,
                taxRule: true,
                variants: {
                    where: { isActive: true },
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

        const { taxRule, ...rest } = product as any;
        return {
            ...rest,
            price: Number(product.price),
            compare_at_price: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stock_quantity: product.stockQuantity,
            category_name: product.category?.name || 'Uncategorized',
            description: product.description || '',
            weight: product.weight ? Number(product.weight) : 0.5,
            width: product.width ? Number(product.width) : null,
            height: product.height ? Number(product.height) : null,
            depth: product.depth ? Number(product.depth) : null,
            costPrice: product.costPrice ? Number(product.costPrice) : null,
            ecotax: product.ecotax ? Number(product.ecotax) : null,
            origin_country: product.originCountry || "Yemen",
            taxRate: product.taxRule?.rate ? Number(product.taxRule.rate) : 0,
            category_slug: product.category?.slug,
            variants: product.variants.map(v => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stock: v.stock,
                weight: v.weight ? Number(v.weight) : null,
                images: v.images,
                attributes: v.attributeValues.map(av => ({
                    name: av.attributeValue.attribute.name,
                    value: av.attributeValue.name
                }))
            }))
        };
    } catch (error) {
        console.error("Error fetching product:", error);
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
        } catch (e) { }
    }

    return {
        title: `${product.name} | Yemeni Market`,
        description: (product as any).description || `Buy authentic ${product.name} from Yemeni Market.`,
        openGraph: {
            title: product.name,
            description: (product as any).description || `Buy authentic ${product.name} from Yemeni Market.`,
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

    const [relatedProducts, newArrivals, carriers] = await Promise.all([
        getRelatedProducts((product as any).categoryId, product.id),
        getNewArrivals(),
        getCarriers()
    ]);

    return (
        <main className="min-h-screen">
            <ProductDetails product={product as any} carriers={carriers as any} />
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <ProductSpecs
                    weight={(product as any).weight || 0.5}
                    origin={(product as any).origin_country || "Yemen"}
                    shelfLife="24 months"
                    description={(product as any).description || ''}
                    category={(product as any).category_slug || 'honey'}
                />
                <ProductCarousel title="Produits Similaires" products={relatedProducts as any} />
                <ProductCarousel title="Nouveautés" products={newArrivals as any} />
            </div>
        </main>
    );
}
