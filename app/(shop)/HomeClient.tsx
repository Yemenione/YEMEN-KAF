"use client";

import Navbar from "@/components/layout/Navbar";
import ProductShowcase from "@/components/shop/ProductShowcase";
import HeroSlider from "@/components/hero/HeroSlider";
import CategoriesSection from "@/components/shop/CategoriesSection";
import SpecialOffers from "@/components/shop/SpecialOffers";
import BestSellers from "@/components/shop/BestSellers";
import NewArrivals from "@/components/shop/NewArrivals";
import Testimonials from "@/components/shop/Testimonials";
import Newsletter from "@/components/shop/Newsletter";
import FlashSale from "@/components/shop/FlashSale";
import RecentlyViewed from "@/components/shop/RecentlyViewed";
import PromoGrid from "@/components/shop/PromoGrid";
import RamadanSection from "@/components/shop/RamadanSection";
import { Truck, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
    id: number;
    name: string;
    rating: number;
    comment: string;
    avatar?: string;
}

interface Article {
    title: string;
    excerpt: string;
    image: string;
    date: string;
    slug: string;
    readTime: string;
    category: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
    [key: string]: unknown;
}

interface HomeClientProps {
    reviews: Review[];
    posts: Article[];
    categories: Category[];
}

export default function HomeClient({ reviews, categories }: HomeClientProps) {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-white">
            {/* Navigation */}
            <Navbar />

            {/* 2D Cinematic Hero */}
            <HeroSlider />


            {/* Promo Grid - Amazon Style v3 */}
            <PromoGrid categories={categories} />

            {/* Ramadan Special Section */}
            <RamadanSection />

            {/* Categories Grid */}
            <CategoriesSection />

            {/* Best Sellers - NEW */}
            <BestSellers />

            {/* Special Offers */}
            <SpecialOffers />

            {/* New Arrivals - NEW */}
            <NewArrivals />

            {/* Flash Sale - Global Standard v3 */}
            <FlashSale />

            {/* Trust Indicators */}
            <section className="w-full py-16 border-t border-black/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center gap-4 group">
                        <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.shipping')}</h3>
                            <p className="text-sm text-[var(--coffee-brown)]/60">{t('product.freeShippingDesc') || 'Livraison gratuite dès 100€'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 group">
                        <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.authentic') || 'Produits Authentiques'}</h3>
                            <p className="text-sm text-[var(--coffee-brown)]/60">{t('trust.quality') || 'Qualité Premium Garantie'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 group">
                        <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                            <Star className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.excellence') || 'Excellence Yéménite'}</h3>
                            <p className="text-sm text-[var(--coffee-brown)]/60">{t('trust.subtitle') || 'Le meilleur du Yémen à votre porte'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Showcase */}
            <ProductShowcase />

            {/* Testimonials - NEW */}
            <Testimonials reviews={reviews} />

            {/* Recently Viewed - Global Standard v3 */}
            <RecentlyViewed />

            {/* Newsletter - NEW */}
            <Newsletter />
        </main>
    );
}
