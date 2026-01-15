"use client";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import ProductShowcase from "@/components/shop/ProductShowcase";
import HeroSlider from "@/components/hero/HeroSlider";
import CategoriesSection from "@/components/shop/CategoriesSection";
import SpecialOffers from "@/components/shop/SpecialOffers";
import { Truck, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* 2D Cinematic Hero */}
      <HeroSlider />

      {/* Categories Grid */}
      <CategoriesSection />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Trust Indicators */}
      <section className="w-full py-16 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('footer.shipping')}</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">{t('product.freeShipping')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('product.authentic')}</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">{t('product.qualityGuaranteed')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('product.qualityGuaranteed')}</h3>
              <p className="text-sm text-[var(--coffee-brown)]/60">{t('home.hero.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <ProductShowcase />
    </main>
  );
}
