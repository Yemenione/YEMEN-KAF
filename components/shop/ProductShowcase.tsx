"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import QamariyaPattern from "@/components/ui/QamariyaPattern";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    image_url: string;
    slug: string;
    category_name: string;
}

export default function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products?limit=12');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="w-full py-32 bg-white text-center">Loading...</div>;
    }

    return (
        <section className="w-full py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-gray-400 uppercase tracking-[0.4em] text-xs font-semibold block mb-4">Curated Collection</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-black leading-tight">Taste the<br />Heritage</h2>
                    </div>

                    <button className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-black pb-1 hover:text-gray-600 transition-colors">
                        View Full Catalog
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                                <ProductCard
                                    id={product.id}
                                    title={product.name}
                                    price={`€${Number(product.price).toFixed(2)}`}
                                    image={product.image_url || '/images/honey-jar.jpg'}
                                    category={product.category_name || 'Collection'}
                                />
                            </Link>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No products found.</p>
                    )}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <button className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-black pb-1">
                        View Full Catalog
                    </button>
                </div>
            </div>
        </section>
    );
}
