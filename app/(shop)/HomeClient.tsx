"use client";

import dynamic from "next/dynamic";
import HeroSlider from "@/components/hero/HeroSlider";
import PromoGrid from "@/components/shop/PromoGrid";

const CategoriesSection = dynamic(() => import("@/components/shop/CategoriesSection"));
const SpecialOffers = dynamic(() => import("@/components/shop/SpecialOffers"));
const BestSellers = dynamic(() => import("@/components/shop/BestSellers"));
const NewArrivals = dynamic(() => import("@/components/shop/NewArrivals"));
const Testimonials = dynamic(() => import("@/components/shop/Testimonials"));
const Newsletter = dynamic(() => import("@/components/shop/Newsletter"));
const FlashSale = dynamic(() => import("@/components/shop/FlashSale"));
const RecentlyViewed = dynamic(() => import("@/components/shop/RecentlyViewed"));
const RamadanSection = dynamic(() => import("@/components/shop/RamadanSection"));
const FeaturedBrands = dynamic(() => import("@/components/shop/FeaturedBrands"));
const BlogSection = dynamic(() => import("@/components/shop/BlogSection"));
const TrustIndicators = dynamic(() => import("@/components/shop/TrustIndicators"));
const ProductShowcase = dynamic(() => import("@/components/shop/ProductShowcase"));

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
    readTime?: string;
    category?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
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

export default function HomeClient({ reviews, posts, categories }: HomeClientProps) {

    return (
        <main className="min-h-screen bg-white">
            {/* 2D Cinematic Hero */}
            <div className="">
                <HeroSlider />
            </div>

            {/* Promo Grid - Amazon Style v3 */}
            <div className="py-6 lg:py-10 bg-[#FBFBFB]">
                <PromoGrid categories={categories} />
            </div>

            {/* Ramadan Special Section */}
            <div className="py-6">
                <RamadanSection />
            </div>

            {/* Categories Grid */}
            <div className="py-6 bg-white">
                <CategoriesSection />
            </div>

            {/* Best Sellers - NEW */}
            <div className="py-6">
                <BestSellers />
            </div>

            {/* Special Offers */}
            <div className="py-6 bg-[#FBFBFB]">
                <SpecialOffers />
            </div>

            {/* New Arrivals - NEW */}
            <div className="py-6">
                <NewArrivals />
            </div>

            {/* Flash Sale - Global Standard v3 */}
            <div className="py-8 bg-black text-white">
                <FlashSale />
            </div>

            {/* Trust Indicators */}
            <TrustIndicators />

            {/* Product Showcase */}
            <div className="py-8">
                <ProductShowcase />
            </div>

            {/* Testimonials - NEW */}
            <div className="py-8">
                <Testimonials reviews={reviews} />
            </div>

            {/* Blog Section */}
            <div className="py-8">
                <BlogSection articles={posts} />
            </div>

            {/* Recently Viewed - Global Standard v3 */}
            <div className="py-8">
                <RecentlyViewed />
            </div>

            {/* Featured Brands - NEW */}
            <div className="py-8">
                <FeaturedBrands />
            </div>

            {/* Newsletter - NEW */}
            <div className="py-8">
                <Newsletter />
            </div>
        </main>
    );
}
