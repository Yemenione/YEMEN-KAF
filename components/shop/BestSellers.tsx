import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    images?: string;
    slug: string;
}

export default function BestSellers() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t } = useLanguage();

    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';
            if (product.images.startsWith('http') || product.images.startsWith('/')) {
                return product.images;
            }
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch (e) {
            if (product.images && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
        }
        return '/images/honey-jar.jpg';
    };

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const res = await fetch('/api/products?limit=4&sort=featured');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch best sellers:", error);
            }
        };

        fetchBestSellers();
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('home.bestSellers.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] mt-4">
                        {t('home.bestSellers.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Image
                                    src={getMainImage(product)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute top-2 start-2 bg-[var(--honey-gold)] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    {t('home.bestSellers.topSale')}
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-serif text-lg text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-[var(--coffee-brown)]">
                                        €{Number(product.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
