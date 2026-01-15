import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import ProductShowcase from "@/components/shop/ProductShowcase";
import HeroSlider from "@/components/hero/HeroSlider";
import CategoriesSection from "@/components/shop/CategoriesSection";
import SpecialOffers from "@/components/shop/SpecialOffers";
import { Truck, ShieldCheck, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-x-hidden bg-[var(--cream-white)]">
      {/* Navigation */}
      <Navbar />

      {/* 2D Cinematic Hero (Replacing 3D) */}
      <HeroSlider />

      {/* Categories Grid */}
      <CategoriesSection />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Trust Indicators */}
      <section className="w-full py-12 bg-[var(--coffee-brown)]/5 border-b border-[var(--coffee-brown)]/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <Truck className="w-8 h-8 text-[var(--honey-gold)]" />
            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Worldwide Shipping</h3>
            <p className="text-sm text-[var(--coffee-brown)]/70">Direct from Yemen to your door</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[var(--honey-gold)]" />
            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Authenticity Guaranteed</h3>
            <p className="text-sm text-[var(--coffee-brown)]/70">Lab-tested for 100% purity</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Star className="w-8 h-8 text-[var(--honey-gold)]" />
            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Premium Quality</h3>
            <p className="text-sm text-[var(--coffee-brown)]/70">Curated from the best harvests</p>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <ProductShowcase />


    </main>
  );
}
