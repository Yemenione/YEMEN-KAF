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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat, index) => (
                        <Link key={cat.id} href={cat.link} className="group block relative h-[60vh] w-full overflow-hidden rounded-2xl">
                            {/* Image */}
                            <Image
                                src={cat.image}
                                alt={cat.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />

                            {/* Gradient Overlay for Text Visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                            <div className="absolute bottom-0 left-0 w-full p-8 text-center flex flex-col items-center z-10">
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                    Explore Collection
                                </span>
                                <h3 className="text-3xl md:text-4xl font-serif text-white mb-2 shadow-sm">{cat.title}</h3>
                                <p className="text-white/70 text-sm font-light tracking-wide max-w-[200px]">{cat.description}</p>
                            </div>

                            <div className="absolute top-6 right-6">
                                <ArrowUpRight className="text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
