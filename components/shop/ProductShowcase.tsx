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
        <section className="relative w-full py-32 bg-[var(--cream-white)] overflow-hidden">
            <QamariyaPattern />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-[var(--coffee-brown)]/80 uppercase tracking-[0.4em] text-sm font-semibold block mb-4">Curated Collection</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)]">Taste the Heritage</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                <div className="mt-16 text-center">
                    <button className="px-10 py-4 border border-[var(--coffee-brown)] text-[var(--coffee-brown)] uppercase tracking-widest hover:bg-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-all duration-300 font-medium">
                        View All Products
                    </button>
                </div>
            </div>
        </section>
    );
}
