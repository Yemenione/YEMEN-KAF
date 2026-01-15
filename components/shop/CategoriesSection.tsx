"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { INITIAL_CATEGORIES } from "@/utils/categories";

const CATEGORIES = INITIAL_CATEGORIES;

export default function CategoriesSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, index) => (
                        <Link key={cat.id} href={cat.link} className={`group block relative w-full aspect-[3/4] overflow-hidden bg-gray-100 ${index === 1 ? 'md:translate-y-12' : ''}`}>
                            {/* Staggered Effect via Translate instead of margin to avoid collapse */}

                            <Image
                                src={cat.image}
                                alt={cat.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />

                            {/* Overlay Gradient - Stronger at bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                                <span className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--honey-gold)] mb-2">
                                    Explore
                                </span>
                                <h3 className="text-3xl font-serif mb-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">{cat.title}</h3>
                                <p className="text-white/70 text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    {cat.description}
                                </p>
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 z-20">
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-500">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
