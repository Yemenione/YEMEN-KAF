import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import ProductShowcase from "@/components/shop/ProductShowcase";
import HeroSlider from "@/components/hero/HeroSlider";
import CategoriesSection from "@/components/shop/CategoriesSection";
import SpecialOffers from "@/components/shop/SpecialOffers";
import { Truck, ShieldCheck, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* 2D Cinematic Hero */}
      <HeroSlider />

      {/* Categories Grid - Now Prominently Displayed */}
      <CategoriesSection />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Trust Indicators - Minimalist Rebrand */}
      <section className="w-full py-16 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Global Shipping</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">Complimentary on orders over $150</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Authenticity</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">Source verified directly from farms</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">Premium Quality</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">Harvested by master artisans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <ProductShowcase />


    </main>
  );
}
