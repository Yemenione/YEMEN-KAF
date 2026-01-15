"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function TheFarmsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto space-y-6">
                <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.4em]">Terroir</span>
                <h1 className="text-6xl md:text-8xl font-serif text-[var(--coffee-brown)]">The Farms</h1>
                <p className="text-[var(--coffee-brown)]/60 text-lg leading-relaxed">
                    Yemen's geography is unlike anywhere else on Earth. High-altitude peaks and secluded valleys create microclimates perfect for the world's most distinct flavors.
                </p>
            </div>

            {/* Region 1: Do'an */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh]">
                <div className="relative bg-gray-100 order-2 md:order-1 min-h-[50vh]">
                    <Image src="/images/honey-comb.jpg" alt="Doan Valley" fill className="object-cover" />
                </div>
                <div className="flex items-center justify-center p-12 md:p-24 bg-white order-1 md:order-2">
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                            <MapPin size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Wadi Do'an, Hadramout</span>
                        </div>
                        <h2 className="text-4xl font-serif text-[var(--coffee-brown)]">The Valley of Honey</h2>
                        <p className="text-[var(--coffee-brown)]/70 leading-relaxed">
                            Known as the Grand Canyon of Yemen, Wadi Do'an is home to the ancient Sidr trees. Here, bees collect nectar from the sacred trees, producing a honey that is thick, potent, and medicinal. The isolation of the valley ensures no pesticides or pollutants touch the hives.
                        </p>
                        <Link href="/shop?category=honey" className="inline-block border-b border-[var(--coffee-brown)] pb-1 text-xs uppercase tracking-widest font-bold pt-4">
                            Shop Sidr Honey
                        </Link>
                    </div>
                </div>
            </section>

            {/* Region 2: Haraz */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh]">
                <div className="flex items-center justify-center p-12 md:p-24 bg-[var(--coffee-brown)] text-white">
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                            <MapPin size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Haraz Mountains, Sana'a</span>
                        </div>
                        <h2 className="text-4xl font-serif">Clouds & Coffee</h2>
                        <p className="text-white/70 leading-relaxed">
                            At altitudes above 2,000 meters, the coffee cherries of Haraz ripen slowly in the mist. This stress on the fruit creates sugar-dense beans with complex notes of dried fruit, chocolate, and wine. It is the original Mocha, unchanged for 500 years.
                        </p>
                        <Link href="/shop?category=coffee" className="inline-block border-b border-white pb-1 text-xs uppercase tracking-widest font-bold pt-4 hover:text-[var(--honey-gold)] hover:border-[var(--honey-gold)] transition-colors">
                            Shop Haraz Mocha
                        </Link>
                    </div>
                </div>
                <div className="relative bg-gray-800 min-h-[50vh]">
                    <Image src="/images/coffee-beans.jpg" alt="Haraz Mountains" fill className="object-cover" />
                </div>
            </section>
        </main>
    );
}
