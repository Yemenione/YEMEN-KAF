"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import QamariyaPattern from "@/components/ui/QamariyaPattern";

const PRODUCT_DATA = [
    {
        id: 1,
        title: "Royal Sidr Honey",
        price: "$180.00",
        image: "/images/honey-jar.jpg",
        category: "Honey",
        slug: "royal-sidr-honey"
    },
    {
        id: 2,
        title: "Haraz Mocha Beans",
        price: "$45.00",
        image: "/images/coffee-beans.jpg",
        category: "Coffee",
        slug: "haraz-mocha-beans"
    },
    {
        id: 3,
        title: "Wild Mountain Comb",
        price: "$220.00",
        image: "/images/honey-comb.jpg",
        category: "Reserve",
        slug: "wild-mountain-comb"
    }
];

export default function ProductShowcase() {
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {PRODUCT_DATA.map((product) => (
                        <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                            <ProductCard
                                title={product.title}
                                price={product.price}
                                image={product.image}
                                category={product.category}
                            />
                        </Link>
                    ))}
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
