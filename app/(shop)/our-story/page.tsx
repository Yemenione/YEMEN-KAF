"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OurStoryPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[80vh] w-full overflow-hidden">
                <Image
                    src="/images/honey-comb.jpg"
                    alt="Yemeni Heritage"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-[var(--honey-gold)] text-sm font-bold uppercase tracking-[0.4em] mb-4">Our Heritage</span>
                    <h1 className="text-6xl md:text-9xl font-serif text-white tracking-tight mb-8">
                        The Origin
                    </h1>
                </div>
            </section>

            {/* Content I: The Philosophy */}
            <section className="py-32 px-6 md:px-20 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] leading-tight">
                            Preserving an Ancient <br />
                            <span className="italic text-[var(--honey-gold)]">Legacy.</span>
                        </h2>
                        <p className="text-[var(--coffee-brown)]/70 leading-relaxed text-lg font-light">
                            Yemeni Market was founded with a singular purpose: to bridge the gap between the ancient, untouched valleys of Yemen and the modern connoisseur.
                            <br /><br />
                            Our Sidr Honey is not just a product; it is a sacred elixir, harvested using methods that have remained unchanged for centuries. Our Coffee is the original Mocha, born from the very soil where coffee was first cultivated.
                        </p>
                        <div className="pt-4">
                            <span className="block text-xs font-bold uppercase tracking-widest text-[var(--coffee-brown)] mb-2">Signature</span>
                            <div className="h-[1px] w-20 bg-[var(--coffee-brown)]" />
                        </div>
                    </div>
                    <div className="relative aspect-[3/4] bg-gray-100">
                        {/* Placeholder for Founder or Landscape image */}
                        <Image
                            src="/images/hero-1.jpg" // Fallback to missing image logic, or use existing
                            alt="The Valley"
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                            {/* Fallback visual if image missing */}
                            <span className="uppercase tracking-widest text-xs">Image: The Valley</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content II: The Process */}
            <section className="bg-[var(--coffee-brown)] text-white py-32 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-16">
                    <div className="space-y-6">
                        <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.3em]">Uncompromising Quality</span>
                        <h2 className="text-4xl md:text-6xl font-serif">From the Hive to the Home</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {[
                            { title: "01. Sourcing", desc: "We work exclusively with generational beekeepers in the Do'an Valley." },
                            { title: "02. Testing", desc: "Every batch is lab-tested for purity, ensuring 0% sugar adulteration." },
                            { title: "03. Selection", desc: "Only the finest 'Royal' grade honey makes it into our black jars." }
                        ].map((step, idx) => (
                            <div key={idx} className="space-y-4 border-t border-white/10 pt-8 hover:border-[var(--honey-gold)] transition-colors duration-500 group">
                                <h3 className="text-2xl font-serif group-hover:text-[var(--honey-gold)] transition-colors">{step.title}</h3>
                                <p className="text-white/60 leading-relaxed max-w-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="h-[60vh] relative flex items-center justify-center bg-gray-100 overflow-hidden">
                <Image
                    src="/images/coffee-beans.jpg"
                    alt="Texture"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="text-center relative z-10 space-y-8">
                    <h2 className="text-5xl font-serif text-[var(--coffee-brown)]">Taste the History</h2>
                    <Link href="/shop" className="inline-flex items-center gap-4 px-12 py-4 bg-[var(--coffee-brown)] text-white uppercase tracking-widest font-bold text-xs hover:bg-[var(--coffee-brown)]/90 transition-all">
                        Explore Collection <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
