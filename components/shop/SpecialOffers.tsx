"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

const OFFERS = [
    {
        id: "bundle-1",
        title: "The Royal Treatment",
        description: "1kg Sidr Honey + 500g Haraz Mocha",
        price: "$210.00",
        originalPrice: "$225.00",
        image: "/images/honey-jar.jpg",
        slug: "royal-treatment-bundle"
    },
    {
        id: "bundle-2",
        title: "Morning Ritual",
        description: "2x Haraz Mocha Beans + Ceramic Cup",
        price: "$85.00",
        originalPrice: "$100.00",
        image: "/images/coffee-beans.jpg",
        slug: "morning-ritual-bundle"
    }
];

export default function SpecialOffers() {
    return (
        <section className="py-24 bg-white border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold block">Exclusive Bundles</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)]">Curated Offers</h2>
                    </div>
                    <Link href="/shop" className="group flex items-center gap-2 text-[var(--coffee-brown)] border-b border-[var(--coffee-brown)] pb-1 hover:text-[var(--honey-gold)] transition-colors uppercase tracking-widest text-xs font-bold">
                        View All Collections <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {OFFERS.map((offer) => (
                        <div key={offer.id} className="group relative">
                            {/* Image Part */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 mb-8">
                                <Image
                                    src={offer.image}
                                    alt={offer.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute top-0 left-0 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--coffee-brown)] z-10">
                                    Limited Edition
                                </div>
                            </div>

                            {/* Text Part */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-serif text-3xl text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors">{offer.title}</h3>
                                    <p className="text-[var(--coffee-brown)]/60 text-sm leading-relaxed">{offer.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-serif text-[var(--coffee-brown)]">{offer.price}</span>
                                    <span className="text-xs text-[var(--coffee-brown)]/40 line-through decoration-current">Was {offer.originalPrice}</span>
                                </div>
                            </div>

                            <button className="mt-6 w-full md:w-auto px-8 py-3 bg-[var(--coffee-brown)] text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:bg-[var(--coffee-brown)]/90">
                                Shop Bundle
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
