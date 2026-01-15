"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
    {
        id: "honey",
        title: "Rare Honey",
        description: "Sidr, Sumar, & White Honey",
        image: "/images/honey-jar.jpg",
        link: "/shop?category=honey"
    },
    {
        id: "coffee",
        title: "Mocha Coffee",
        description: "Husks, Light, & Dark Roast",
        image: "/images/coffee-beans.jpg",
        link: "/shop?category=coffee"
    },
    {
        id: "gifts",
        title: "Gifts & Sets",
        description: "Curated Boxes for Loved Ones",
        image: "/images/honey-comb.jpg",
        link: "/shop?category=gifts"
    }
];

export default function CategoriesSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, index) => (
                        <Link key={cat.id} href={cat.link} className={`group block relative aspect-[3/4] overflow-hidden ${index === 1 ? 'md:-mt-12' : ''}`}>
                            {/* Staggered Grid Effect */}
                            <Image
                                src={cat.image}
                                alt={cat.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />

                            {/* Minimal Overlay - Text is always visible now but refined */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                    Explore Collection
                                </span>
                                <h3 className="text-4xl font-serif text-white mb-2">{cat.title}</h3>
                                <p className="text-white/80 text-sm font-light tracking-wide">{cat.description}</p>
                            </div>

                            <div className="absolute bottom-6 right-6">
                                <ArrowUpRight className="text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
