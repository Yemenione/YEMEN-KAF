"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Check, ShieldCheck, MapPin, Truck, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import QamariyaPattern from "@/components/ui/QamariyaPattern"; // Pattern might need update too, or removal if too complex

// Mock Data (In a real app, fetch from DB using slug)
const PRODUCTS: Record<string, any> = {
    "royal-sidr-honey": {
        title: "Royal Sidr Honey",
        price: "$180.00",
        image: "/images/honey-jar.jpg",
        tagline: "The Liquid Gold of Wadi Do'an",
        description: "Harvested only once a year from the sacred Sidr trees in the remote valleys of Hadramout. This distinct, monochromatic honey offers a rich, butterscotch-like flavor profile and potent medicinal properties backed by centuries of tradition.",
        origin: "Hadramout, Yemen",
        elevation: "800m - 1200m",
        notes: "Butterscotch, Toasted Nuts, Wildflowers",
        features: ["100% Raw & Unfiltered", "Lab Tested for Purity", "Single Origin Harvest"]
    },
    // ... (rest same data struct)
    "haraz-mocha-beans": {
        title: "Haraz Mocha Beans",
        price: "$45.00",
        image: "/images/coffee-beans.jpg",
        tagline: "The Wine of Araby",
        description: "Grown on the terraced clouds of the Haraz mountains. These sun-dried cherries process ancient varietals that define the true taste of Mocha. Complex, fruity, and intensely aromatic.",
        origin: "Haraz Mountains, Yemen",
        elevation: "2200m+",
        notes: "Dark Chocolate, Dried Fruit, Spices",
        features: ["Sun-Dried (Natural Process)", "Hand-Picked Cherries", "Ancient Heirloom Varietal"]
    },
    "wild-mountain-comb": {
        title: "Wild Mountain Comb",
        price: "$220.00",
        image: "/images/honey-comb.jpg",
        tagline: "Nature's Perfect Architecture",
        description: "A rare delicacy cut directly from the hive in the high peaks of Mahwit. Consuming the wax comb along with the honey provides the full spectrum of propolis and pollen benefits.",
        origin: "Al-Mahwit, Yemen",
        elevation: "1800m",
        notes: " Floral, Crisp Wax, Intense Sweetness",
        features: ["Contains Royal Jelly", "Rich in Propolis", "Limited Seasonal Supply"]
    },
    "doan-white-honey": {
        title: "Do'an White Honey",
        price: "$160.00",
        image: "/images/honey-jar.jpg",
        tagline: "The Snow of the Desert",
        description: "A rare variety of Sidr honey that crystallizes into a creamy, white texture. Known for its delicate floral notes and smooth finish.",
        origin: "Do'an, Yemen",
        elevation: "900m",
        notes: "Floral, Creamy, Vanilla",
        features: ["Rapid Crystallization", "Delicate Flavor", "High Pollen Content"]
    }
};

export default function ProductDetailPage() {
    const params = useParams();
    const { addToCart } = useCart();
    const slug = params.slug as string;
    const product = PRODUCTS[slug] || PRODUCTS["royal-sidr-honey"]; // Fallback

    return (
        <main className="min-h-screen bg-white text-[var(--coffee-brown)]">
            <Navbar />

            {/* Product Hero Section - Split Screen */}
            <section className="pt-32 lg:pt-48 min-h-screen flex flex-col lg:flex-row">

                {/* Image Side (Left) - Fixed on Desktop */}
                <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:h-[calc(100vh-140px)] lg:sticky lg:top-32 bg-[#F5F5F7] lg:rounded-r-3xl overflow-hidden mt-4 lg:mt-0 shadow-inner">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute top-6 left-6 z-10">
                        <span className="bg-white/90 backdrop-blur px-4 py-2 uppercase tracking-widest text-[10px] font-bold border border-black/5 shadow-sm">
                            Ultra Premium
                        </span>
                    </div>
                </div>

                {/* Details Side (Right) - Scrollable */}
                <div className="w-full lg:w-1/2 px-6 py-12 lg:px-24 flex flex-col justify-start">
                    <div className="space-y-8 animate-fade-in-up">

                        {/* Header */}
                        <div>
                            <span className="text-[var(--honey-gold)] text-xs uppercase tracking-[0.3em] font-bold block mb-4">{product.origin}</span>
                            <h1 className="text-5xl md:text-7xl font-serif leading-none tracking-tight text-[var(--coffee-brown)] mb-4">{product.title}</h1>
                            <span className="text-3xl font-light text-[var(--coffee-brown)] block">{product.price}</span>
                        </div>

                        <p className="text-lg leading-relaxed font-light text-[var(--coffee-brown)]/80 border-t border-black/5 pt-8">
                            {product.description}
                        </p>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-8 border-y border-black/5 py-8">
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--coffee-brown)]/40 mb-2">Elevation</h4>
                                <p className="font-serif text-xl">{product.elevation}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--coffee-brown)]/40 mb-2">Tasting Notes</h4>
                                <p className="font-serif text-xl">{product.notes}</p>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 pt-2">
                            {product.features?.map((feature: string, i: number) => (
                                <li key={i} className="flex items-center gap-4 text-sm font-medium tracking-wide text-[var(--coffee-brown)]/80">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--honey-gold)]/10 text-[var(--honey-gold)]">
                                        <Check size={14} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Action - Enhanced Services */}
                        <div className="pt-8 space-y-6">
                            <button
                                onClick={() => addToCart({
                                    id: slug,
                                    title: product.title,
                                    price: Number(product.price.replace(/[^0-9.-]+/g, "")), // Ensure number
                                    image: product.image
                                })}
                                className="w-full py-5 bg-[var(--coffee-brown)] text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-[var(--coffee-brown)]/90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                            >
                                Add to Cart
                            </button>

                            {/* Services Box */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
                                    <Truck size={24} className="text-[var(--coffee-brown)] mb-3 opacity-80" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coffee-brown)] mb-1">Free Shipping</span>
                                    <span className="text-[10px] text-[var(--coffee-brown)]/60">Worldwide Orders $150+</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
                                    <ShieldCheck size={24} className="text-[var(--coffee-brown)] mb-3 opacity-80" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coffee-brown)] mb-1">Authentic</span>
                                    <span className="text-[10px] text-[var(--coffee-brown)]/60">Verified Origin</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}
