"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Check, Shield, ArrowLeft, ChevronDown, Clock, Flame, Share2, Facebook, Copy, MapPin, Camera, X, Plus, Minus, Truck, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import BestSellers from "./BestSellers";
import NewArrivals from "./NewArrivals";
import { getMainImage, getAllImages } from "@/lib/image-utils";

interface VariantAttribute {
    name: string;
    value: string;
}

interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    stock: number;
    images: string | string[] | null;
    attributes: VariantAttribute[];
}

interface Product {
    id: number;
    name: string;
    slug?: string;
    price: number;
    compare_at_price?: number | null;
    description: string | null;
    images: string | string[] | null;
    taxRate?: number;
    category_name?: string;
    variants: ProductVariant[];
    stock?: number;
    stock_quantity?: number;
    quantity?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: any;
    origin_country?: string;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    images?: string; // JSON string of array
    createdAt: string;
    patient: {
        firstName: string;
        lastName: string;
    };
    isVerified?: boolean;
}

interface Carrier {
    id: number;
    name: string;
    logo: string | null;
    deliveryTime: string | null;
}

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between group transition-all"
            >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors">{title}</span>
                <ChevronDown size={18} className={`text-gray-300 group-hover:text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
}

export default function ProductDetails({ product, carriers = [] }: { product: Product, carriers?: Carrier[] }) {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { t, language, getLocalizedValue } = useLanguage();

    const isWishlisted = isInWishlist(product.id);

    // Localized Strings
    const localizedName = getLocalizedValue(product, 'name');
    const localizedDescription = getLocalizedValue(product, 'description');

    // Construct a pseudo-category object for translation if needed
    const categoryObj = { name: product.category_name, translations: product.category_translations };
    const localizedCategoryName = getLocalizedValue(categoryObj, 'name');

    // State
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [currentMobileImage, setCurrentMobileImage] = useState(0);
    const galleryRef = useRef<HTMLDivElement>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        description: true,
        specs: false,
        shipping: false,
        reviews: false
    });
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    // Review Form State
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [viewingNow, setViewingNow] = useState<number | null>(null);

    // Flash Sale Timer Logic
    useEffect(() => {
        setViewingNow(Math.floor(Math.random() * 20) + 5);
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay.getTime() - now.getTime();

            return {
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollIndex = Math.round(container.scrollLeft / container.clientWidth);
        if (scrollIndex !== currentMobileImage) {
            setCurrentMobileImage(scrollIndex);
        }
    };

    const scrollToImage = (index: number) => {
        if (galleryRef.current) {
            const width = galleryRef.current.clientWidth;
            galleryRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
            setCurrentMobileImage(index);
        }
    };

    // Variants logic initialization (moved up to avoid ReferenceError in hooks)
    const hasVariants = product.variants && product.variants.length > 0;
    const attributes = hasVariants ? product.variants.reduce((acc: Record<string, Set<string>>, variant: ProductVariant) => {
        variant.attributes.forEach((attr: VariantAttribute) => {
            if (!acc[attr.name]) acc[attr.name] = new Set();
            acc[attr.name].add(attr.value);
        });
        return acc;
    }, {}) : {};
    const attributeNames = Object.keys(attributes);

    // Auto-select first variant on load
    useEffect(() => {
        if (hasVariants && Object.keys(selectedOptions).length === 0) {
            const firstVariant = product.variants[0];
            const initialOptions: Record<string, string> = {};
            firstVariant.attributes.forEach(attr => {
                initialOptions[attr.name] = attr.value;
            });
            setSelectedOptions(initialOptions);
        }
    }, [hasVariants, product.variants, selectedOptions]);

    // Delivery Date Calculation (Current + 3 days)
    const getDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    // Recently Viewed Tracking
    useEffect(() => {
        if (product && product.slug) {
            const stored = localStorage.getItem('recentlyViewed');
            let slugs = stored ? JSON.parse(stored) : [];

            // Remove if already exists to move to front
            slugs = slugs.filter((s: string) => s !== product.slug);

            // Add to front
            slugs.unshift(product.slug);

            // Limit to 10
            slugs = slugs.slice(0, 10);

            localStorage.setItem('recentlyViewed', JSON.stringify(slugs));
        }
    }, [product]);

    // Fetch Reviews
    useEffect(() => {
        if (product.slug) {
            fetch(`/api/products/${product.slug}/reviews`)
                .then(res => res.json())
                .then(data => {
                    if (data.reviews) {
                        setReviews(data.reviews);
                        setAverageRating(data.average);
                        setTotalReviews(data.count);
                    }
                })
                .catch(err => console.error("Failed to fetch reviews", err));
        }
    }, [product]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        try {
            const files = Array.from(e.target.files);
            const newImages: string[] = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.url) {
                        newImages.push(data.url);
                    }
                }
            }

            setReviewImages(prev => [...prev, ...newImages]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${product.slug}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: userRating, comment: userComment, images: reviewImages })
            });

            if (res.ok) {
                const newReview = await res.json();
                setReviews([newReview, ...reviews]);
                setUserComment("");
                setReviewImages([]);
                if (product.slug) {
                    const refreshStats = await fetch(`/api/products/${product.slug}/reviews`).then(r => r.json());
                    if (refreshStats.reviews) {
                        setReviews(refreshStats.reviews);
                        setAverageRating(refreshStats.average);
                        setTotalReviews(refreshStats.count);
                    }
                }
                alert(t('common.success') || "Review submitted!");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to submit review");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const productImages = getAllImages(product.images);

    // (End of moved variants logic)

    const selectedVariant = hasVariants ? product.variants.find((v: ProductVariant) => {
        return v.attributes.every((attr: VariantAttribute) => selectedOptions[attr.name] === attr.value);
    }) : null;

    useEffect(() => {
        if (selectedVariant?.id) {
            setSelectedImage(0);
        }
    }, [selectedVariant?.id]);

    const variantImages = selectedVariant ? getAllImages(selectedVariant.images) : null;
    const displayImages = variantImages && variantImages.length > 0 ? variantImages : productImages;
    const mainImage = displayImages[selectedImage] || displayImages[0];

    const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const currentCompareAtPrice = selectedVariant
        ? (selectedVariant.compareAtPrice ? Number(selectedVariant.compareAtPrice) : null)
        : (product.compare_at_price ? Number(product.compare_at_price) : null);

    const currentStock = selectedVariant ? selectedVariant.stock : (product.stock || product.stock_quantity || product.quantity || 0);
    const isOutOfStock = currentStock <= 0;

    const discountPercentage = currentCompareAtPrice && currentCompareAtPrice > currentPrice
        ? Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)
        : null;

    const handleOptionSelect = (attrName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [attrName]: value }));
    };

    const canAddToCart = !isOutOfStock && (!hasVariants || selectedVariant);

    return (
        <main className="min-h-screen bg-gray-50 pt-24 lg:pt-28">
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-black transition-colors">{t('nav.home')}</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-black transition-colors">{t('nav.shop')}</Link>
                        <span>/</span>
                        <span className="text-black">{localizedName}</span>
                    </div>
                </div>
            </div>

            {/* Mobile Layout - Luxury Mockup Style Refined */}
            <div className="lg:hidden pb-16 bg-white">
                {/* Custom Header from Mockup */}
                <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
                    <Link href="/shop" className="p-2 -ml-2">
                        <ArrowLeft size={20} className="text-black" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <Image
                                src="/images/logo-circle.png"
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                            {t('product.details') || "DÉTAILS DU PRODUIT"}
                        </span>
                    </div>
                    <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 -mr-2 text-black"
                    >
                        <Heart size={20} className={isWishlisted ? "fill-black" : ""} />
                    </button>
                </div>

                {/* Product Image Gallery - Swipeable */}
                <div className="relative mb-6">
                    <div
                        ref={galleryRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-[#F9F6F1]"
                    >
                        {displayImages.map((img: string, idx: number) => (
                            <div key={idx} className="flex-shrink-0 w-full snap-center px-4">
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm">
                                    <Image
                                        src={img}
                                        alt={`${localizedName} ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={idx === 0}
                                        sizes="100vw"
                                    />
                                    {discountPercentage && idx === 0 && (
                                        <div className="absolute bottom-6 left-6 bg-[#D4AF37] text-white px-3 py-1 font-bold text-[10px] rounded-full shadow-md uppercase tracking-wider">
                                            -{discountPercentage}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={() => scrollToImage(Math.max(0, currentMobileImage - 1))}
                                className={`absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg z-10 transition-all ${currentMobileImage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronLeft size={20} className="text-black" />
                            </button>
                            <button
                                onClick={() => scrollToImage(Math.min(displayImages.length - 1, currentMobileImage + 1))}
                                className={`absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg z-10 transition-all ${currentMobileImage === displayImages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronRight size={20} className="text-black" />
                            </button>
                        </>
                    )}

                    {/* Pagination Dots */}
                    {displayImages.length > 1 && (
                        <div className="flex justify-center gap-1.5 mt-4">
                            {displayImages.map((_: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-300 ${currentMobileImage === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-gray-200'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-8">
                    {/* Title, Origin & Price - NEW: ADDED PRICE FOR MOBILE */}
                    {/* Title, Origin & Price - RESTORED & IMPROVED */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl md:text-3xl font-serif text-black italic leading-tight flex-1 pr-4">
                                {localizedName}
                            </h1>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-2xl font-light text-black tracking-tight">{currentPrice.toFixed(2)}€</span>
                                {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                                    <div className="text-sm text-gray-300 line-through decoration-gray-300/50 font-light leading-none mt-1">{currentCompareAtPrice.toFixed(2)}€</div>
                                )}
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1.5">
                            {t('product.origin') || "ORIGINE"}: {product.origin_country || "BANI MATAR, YÉMEN"}
                        </p>
                        <div className="flex items-center gap-3">
                            <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                                Altitude: 2000m - 2400m
                            </p>
                            <span className="text-gray-200 text-[8px]">•</span>
                            <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                                {t('product.process') || "PROCÉDÉ"}: NATUREL
                            </p>
                        </div>
                    </div>

                    {/* Stock & Delivery Urgency - RESTORED */}
                    <div className="mb-8 flex items-center justify-between py-4 border-y border-gray-100/60">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'} animate-pulse`}></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-800">
                                {isOutOfStock ? t('product.outOfStock') : t('product.inStock') || "DISPONIBLE"}
                            </span>
                        </div>
                        <div className="text-[10px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                            <Clock size={14} className="text-[#D4AF37]" />
                            {t('product.deliveryIn') || "LIVRAISON"} 48H
                        </div>
                    </div>

                    {/* Tasting Notes Section */}
                    {(() => {
                        const notes = getLocalizedValue(product, 'tasting_notes') || product.translations?.tasting_notes;
                        const getEmoji = (note: string) => {
                            const n = note.toLowerCase();
                            if (n.includes('chocolat')) return '🍫';
                            if (n.includes('fruit')) return '🍒';
                            if (n.includes('miel')) return '🍯';
                            if (n.includes('fleur')) return '🌸';
                            if (n.includes('epice')) return '🌶️';
                            return '✨';
                        };
                        const notesArray = notes
                            ? (Array.isArray(notes) ? notes : String(notes).split(',').map(n => n.trim()))
                            : ["Sélection Royale", "Arôme Ancestral", "Corps Dense"];

                        return (
                            <div className="mb-10">
                                <span className="block text-[9px] font-extrabold text-gray-300 uppercase tracking-widest mb-3">
                                    {t('product.tastingNotes') || "NOTES DE DÉGUSTATION"}
                                </span>
                                <div className="flex flex-wrap gap-2.5 bg-[#F9F6F1] p-1.5 rounded-[1.5rem] w-max max-w-full">
                                    {notesArray.map((note, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-full shadow-sm border border-gray-50/50">
                                            <span className="text-xs">{getEmoji(note)}</span>
                                            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Quantity Selector */}
                    <div className="mb-10">
                        <span className="block text-[9px] font-extrabold text-gray-300 uppercase tracking-widest mb-4">
                            {t('product.quantity') || "QUANTITÉ"}
                        </span>
                        <div className="flex items-center bg-[#F9F6F1] w-max p-1.5 rounded-full border border-gray-100">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow-sm active:scale-90 transition-transform"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow-sm active:scale-90 transition-transform"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Variants Control - Polished for Mobile */}
                    {hasVariants && (
                        <div className="space-y-8 mb-10">
                            {attributeNames.map((attrName) => (
                                <div key={attrName}>
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                            {attrName}
                                        </label>
                                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                                            {selectedOptions[attrName] || t('common.select') || "Choisir"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {Array.from(attributes[attrName] as Set<string>).map((value) => {
                                            const isSelected = selectedOptions[attrName] === value;
                                            const strValue = String(value);
                                            return (
                                                <button
                                                    key={strValue}
                                                    onClick={() => handleOptionSelect(attrName, strValue)}
                                                    className={`px-7 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${isSelected
                                                        ? 'bg-black text-white shadow-xl ring-2 ring-black ring-offset-2'
                                                        : 'bg-[#F9F6F1] text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {strValue}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Collapsible Sections - Luxury Mobile Content */}
                    <div className="border-t border-gray-100 mt-6 pt-2 pb-24">
                        {/* Description Section */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => toggleSection('description')}
                                className="w-full py-6 flex items-center justify-between text-left"
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                                    {t('product.description')}
                                </span>
                                {expandedSections.description ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
                            </button>
                            {expandedSections.description && (
                                <div className="pb-6 animate-fade-in">
                                    <div className="prose prose-sm text-gray-500 leading-relaxed font-medium">
                                        {localizedDescription ? (
                                            <div dangerouslySetInnerHTML={{ __html: localizedDescription }} />
                                        ) : (
                                            <p>{product.description}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specs Section */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => toggleSection('specs')}
                                className="w-full py-6 flex items-center justify-between text-left"
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                                    {t('product.specifications')}
                                </span>
                                {expandedSections.specs ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
                            </button>
                            {expandedSections.specs && (
                                <div className="pb-6 animate-fade-in space-y-4">
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div className="space-y-1">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('product.origin')}</span>
                                            <span className="block text-xs font-semibold">{product.origin_country || "Yemen"}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Altitude</span>
                                            <span className="block text-xs font-semibold">2100m - 2400m</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('product.process')}</span>
                                            <span className="block text-xs font-semibold">Natural</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Variety</span>
                                            <span className="block text-xs font-semibold">Heirloom</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Section */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => toggleSection('shipping')}
                                className="w-full py-6 flex items-center justify-between text-left"
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                                    {t('product.shipping')}
                                </span>
                                {expandedSections.shipping ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
                            </button>
                            {expandedSections.shipping && (
                                <div className="pb-6 animate-fade-in">
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 bg-[#F9F6F1] rounded-2xl">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm">
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-black mb-1">Livraison Sécurisée</p>
                                                <p className="text-[10px] text-gray-500 font-medium tracking-tight leading-tight">Expédition depuis le Yéمن sous 24h avec suivi UPS/FedEx.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reviews Section (Mobile) */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => toggleSection('reviews')}
                                className="w-full py-6 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                                        {t('product.reviews')} ({totalReviews})
                                    </span>
                                    {totalReviews > 0 && (
                                        <div className="flex text-[#D4AF37]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={10} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "" : "text-gray-200"} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {expandedSections.reviews ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
                            </button>
                            {expandedSections.reviews && (
                                <div className="pb-6 animate-fade-in space-y-6">
                                    {reviews.length > 0 ? (
                                        reviews.slice(0, 3).map((review) => (
                                            <div key={review.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{review.patient.firstName} {review.patient.lastName}</span>
                                                    <div className="flex text-[#D4AF37]">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} size={8} fill={star <= review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-gray-500 italic leading-relaxed">"{review.comment}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{t('product.beTheFirstReview') || "Soyez le premier à partager votre expérience"}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            const reviewsSection = document.getElementById('reviews-section-full');
                                            if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="w-full py-3 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-400"
                                    >
                                        {t('product.viewAllReviews') || "VOIR TOUS LES AVIS"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back to top button (Mobile) */}
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-gray-50 p-4 rounded-full text-gray-400 hover:text-black transition-all active:scale-95 flex flex-col items-center gap-1"
                        >
                            <ArrowUp size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{t('product.backToTop') || "RETOUR EN HAUT"}</span>
                        </button>
                    </div>

                    {/* Luxury Brand Story Section (Mobile) */}
                    <div className="mt-12 mb-20 px-4 py-12 bg-[#F9F6F1] rounded-[3rem] text-center space-y-4">
                        <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-[0.3em]">Héritage Millénaire</span>
                        <h3 className="text-2xl font-serif italic text-black">L'Art du Café Yéménite</h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium tracking-tight">
                            Chaque grain est sélectionné à la main dans les montagnes sacrées du Yémen, séché au soleil selon des traditions ancestrales vieilles de plus de 500 ans.
                        </p>
                        <div className="pt-4 flex justify-center gap-8">
                            <div className="flex flex-col items-center gap-1">
                                <Shield size={20} className="text-[#D4AF37]" />
                                <span className="text-[8px] font-black uppercase tracking-wider">Certifié</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Heart size={20} className="text-[#D4AF37]" />
                                <span className="text-[8px] font-black uppercase tracking-wider">Équitable</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Flame size={20} className="text-[#D4AF37]" />
                                <span className="text-[8px] font-black uppercase tracking-wider">Artisanal</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Mobile Sticky CTA Bar - Enhanced */}
                <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 lg:hidden bg-gradient-to-t from-white via-white/80 to-transparent">
                    <div className="max-w-md mx-auto bg-black text-white rounded-[2rem] p-2 pr-2 shadow-2xl border border-white/10 flex items-center justify-between h-16">
                        <div className="pl-6 pr-4 flex flex-col justify-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                                {selectedVariant?.name || "Standard"}
                            </span>
                            <span className="text-lg font-bold tracking-tight leading-none">€{(currentPrice * quantity).toFixed(2)}</span>
                        </div>

                        <button
                            disabled={!canAddToCart}
                            onClick={() => addToCart({
                                id: product.id,
                                title: localizedName,
                                price: currentPrice,
                                image: displayImages[0],
                                variantId: selectedVariant?.id,
                                variantName: selectedVariant?.name,
                                taxRate: product.taxRate || 0
                            }, quantity)}
                            className={`flex items-center gap-3 px-6 h-12 rounded-full transition-all active:scale-95 ${canAddToCart ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-gray-500 opacity-50 cursor-not-allowed'}`}
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                                {canAddToCart ? (t('product.addToBag') || 'Ajouter') : (t('product.outOfStock') || 'Rupture')}
                            </span>
                            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                                <ShoppingBag size={16} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout (Existing) */}
            <div className="hidden lg:block max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Images */}
                    <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                        <div className="hidden lg:block relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            <Image src={mainImage} alt={localizedName} fill className="object-cover" priority sizes="(min-width: 1024px) 50vw, 100vw" />
                            {discountPercentage && (
                                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 font-bold text-sm rounded-full shadow-xl z-10 uppercase tracking-wider">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>
                        {displayImages.length > 1 && (
                            <div className="hidden lg:grid grid-cols-4 gap-4">
                                {displayImages.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black ring-2 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${localizedName} ${idx + 1}`}
                                            fill
                                            className="object-contain p-2"
                                            sizes="25vw"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-8 border-b border-gray-100 pb-8">
                            <h2 className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-4 flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-gray-300"></span>
                                {localizedCategoryName}
                            </h2>
                            <h1 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight font-medium tracking-tight">{localizedName}</h1>

                            {/* Star Rating Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex text-[#D4AF37]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={18} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "" : "text-gray-200"} />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-gray-400 tracking-wider">({totalReviews} {t('product.reviews') || 'AVIS'})</span>
                            </div>

                            {/* Flash Sale Urgency (Shein Style) */}
                            <div className="flex items-center gap-3 mb-6 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                                <Clock size={16} className="text-red-600" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{t('product.flashSale') || "OFFRE FLASH SE TERMINE DANS"}</span>
                                    <span className="text-sm font-mono font-bold text-red-700">
                                        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-6 mb-4">
                                <span className="text-4xl font-light text-black tracking-tight">{currentPrice.toFixed(2)}€</span>
                                {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                                    <span className="text-xl text-gray-300 line-through decoration-gray-300/50 font-light">{currentCompareAtPrice.toFixed(2)}€</span>
                                )}
                            </div>

                            {/* Social Proof viewing now (Amazon Style) */}
                            {viewingNow !== null && (
                                <div className="flex items-center gap-2 mb-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Flame size={12} className="text-orange-500" />
                                    <span>{viewingNow} {t('product.viewingNow') || "PERSONNES CONSULTENT CE PRODUIT"}</span>
                                </div>
                            )}
                        </div>

                        {/* Variants and Add to Cart Section */}
                        {hasVariants && (
                            <div className="space-y-8 mb-10">
                                {attributeNames.map((attrName) => (
                                    <div key={attrName}>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                                            {attrName}: <span className="text-black ml-2">{selectedOptions[attrName] || '—'}</span>
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            {Array.from(attributes[attrName] as Set<string>).map((value) => {
                                                const isSelected = selectedOptions[attrName] === value;
                                                const strValue = String(value);

                                                const isColorAttr = ['color', 'couleur', 'colour', 'lon', 'teinte', 'flavor', 'saveur', 'type'].includes(attrName.toLowerCase());
                                                let swatchImage = null;

                                                if (isColorAttr && product.variants) {
                                                    const textVariant = product.variants.find((v: ProductVariant) =>
                                                        v.attributes.some((a: VariantAttribute) => a.name === attrName && a.value === strValue)
                                                    );
                                                    if (textVariant) {
                                                        const vImages = getAllImages(textVariant.images);
                                                        if (vImages && vImages.length > 0) swatchImage = vImages[0];
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={strValue}
                                                        onClick={() => handleOptionSelect(attrName, strValue)}
                                                        className={`relative transition-all duration-300 ${swatchImage
                                                            ? `w-14 h-14 rounded-full p-1 ${isSelected ? 'ring-2 ring-black ring-offset-4 scale-110' : 'ring-1 ring-gray-100 hover:ring-gray-300 hover:scale-105'}`
                                                            : `px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest ${isSelected ? 'border-black bg-black text-white shadow-xl scale-105' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-black hover:bg-gray-50'}`
                                                            }`}
                                                        title={strValue}
                                                    >
                                                        {swatchImage ? (
                                                            <span className="block w-full h-full rounded-full overflow-hidden relative shadow-inner bg-gray-50">
                                                                <Image
                                                                    src={swatchImage}
                                                                    alt={strValue}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="56px"
                                                                />
                                                            </span>
                                                        ) : (
                                                            strValue
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mb-8 space-y-3">
                            <p className="text-[11px] text-gray-600 font-medium flex items-center gap-2">
                                <Check size={14} className="text-green-500" />
                                {t('product.deliveryPromise') || "Livraison Gratuite : Recevez-le chez vous le"} <span className="text-black font-bold uppercase">{getDeliveryDate()}</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <div className="flex-shrink-0 flex items-center border border-gray-100 rounded-full bg-white shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-14 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold text-sm tracking-tighter">{quantity}</span>
                                <button
                                    onClick={() => {
                                        const stock = selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? product.quantity ?? 10;
                                        setQuantity(Math.min(stock, quantity + 1));
                                    }}
                                    className="w-12 h-14 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            {/* Desktop only Add to Cart button */}
                            <button
                                disabled={!canAddToCart}
                                onClick={() => addToCart({
                                    id: product.id,
                                    title: localizedName,
                                    price: currentPrice,
                                    image: displayImages[0],
                                    variantId: selectedVariant?.id,
                                    variantName: selectedVariant?.name,
                                    taxRate: product.taxRate || 0
                                }, quantity)}
                                className={`hidden lg:flex flex-1 py-5 rounded-full uppercase tracking-[0.2em] font-bold text-sm shadow-xl items-center justify-center gap-3 transition-all duration-500 ${canAddToCart
                                    ? 'bg-black text-white hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <ShoppingBag className="w-4 h-4" /> {canAddToCart ? (t('product.addToBag') || 'Ajouter au Panier') : (t('product.outOfStock') || 'RUPTURE DE STOCK')}
                            </button>
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className="hidden lg:block p-5 border border-gray-100 rounded-full hover:border-black transition-all bg-white shadow-sm group"
                            >
                                <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-300 group-hover:text-red-500"}`} />
                            </button>
                        </div>

                        {/* Social Sharing */}
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('product.share') || "PARTAGER"}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `${t('product.checkOut') || 'Découvrez'} ${localizedName} - Yemeni Market`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                                    title="WhatsApp"
                                >
                                    <Share2 size={14} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                                    title="Facebook"
                                >
                                    <Facebook size={14} />
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert(t('common.copied') || 'Lien copié !');
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors"
                                    title="Copy Link"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Delivery & Warranty Section (Moved to Top) */}
                        <div className="mb-10 space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            {/* Delivery Times */}
                            <div>
                                <h3 className="font-serif text-lg text-[var(--coffee-brown)] mb-4">Délais de Livraison</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={14} /> France Métropolitaine</span>
                                        <span className="font-bold text-black">48h - 72h</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={14} /> Europe</span>
                                        <span className="font-bold text-black">3 - 5 Jours</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={14} /> International</span>
                                        <span className="font-bold text-black">5 - 10 Jours</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200"></div>

                            {/* Warranty */}
                            <div>
                                <h3 className="font-serif text-lg text-[var(--coffee-brown)] mb-2">Garantie Satisfait ou Remboursé</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                    Nous nous engageons à vous offrir la meilleure qualité. Si vous n&apos;êtes pas satisfait de votre commande, vous disposez de 14 jours pour nous la retourner dans son emballage d&apos;origine.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                                    <Shield size={14} />
                                    <span>Garantie 100% Sécurisé</span>
                                </div>
                            </div>
                        </div>

                        {/* Accordion Sections: Description, Logistics, Security */}
                        <div className="border-t border-gray-100">
                            <Accordion title={t('product.description') || "Description"} defaultOpen={true}>
                                <div className="prose prose-stone prose-sm text-gray-600 leading-relaxed max-w-none" dangerouslySetInnerHTML={{ __html: localizedDescription || '' }} />
                            </Accordion>

                            {carriers.length > 0 && (
                                <Accordion title={t('product.certifiedShipping') || "Expédition Certifiée"}>
                                    <div className="space-y-6">
                                        <div className="flex flex-wrap items-center gap-10">
                                            {carriers.map((carrier) => (
                                                <div key={carrier.id} className="flex flex-col items-center gap-3 group">
                                                    <div className="h-8 w-24 relative grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                                                        {carrier.logo ? (
                                                            <Image src={carrier.logo} alt={carrier.name} fill className="object-contain" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                                                                {carrier.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{carrier.deliveryTime || "48h-72h"}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium italic uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            {t('product.secureDelivery')}
                                        </p>
                                    </div>
                                </Accordion>
                            )}

                            <Accordion title={t('product.security') || "Garanties & Sécurité"}>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                            <Shield size={18} className="text-black" />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em]">{t('product.authenticity')}</h5>
                                            <p className="text-[9px] text-gray-400 font-medium mt-0.5">{t('product.authenticityDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                            <Check size={18} className="text-black" />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em]">{t('product.qualityControl')}</h5>
                                            <p className="text-[9px] text-gray-400 font-medium mt-0.5">{t('product.qualityControlDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                                    <h4 className="text-[8px] uppercase tracking-[0.3em] font-bold text-gray-300 mb-6">{t('product.securePayment')}</h4>
                                    <div className="flex justify-center items-center gap-6 grayscale opacity-30">
                                        <div className="h-3 w-8 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" fill className="object-contain" /></div>
                                        <div className="h-5 w-8 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" fill className="object-contain" /></div>
                                        <div className="h-4 w-10 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" fill className="object-contain" /></div>
                                    </div>
                                </div>
                            </Accordion>
                        </div>

                        {/* Back to Shop */}
                        <div className="mt-12 pt-12 border-t border-gray-50">
                            <Link href="/shop" className="inline-flex items-center gap-3 text-gray-400 hover:text-black transition-all group">
                                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-black transition-colors">
                                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('shop.returnToShop') || 'RETOURNER À LA BOUTIQUE'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="mt-20 border-t border-gray-100 pt-20">
                    <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
                        <h3 className="text-3xl font-serif text-black">{t('product.customerReviews') || 'Expériences Clients'}</h3>
                        <div className="h-[1px] flex-1 bg-gray-100 mx-8 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex text-[#D4AF37]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "" : "text-gray-200"} />
                                ))}
                            </div>
                            <span className="text-lg font-serif">{averageRating.toFixed(1)}/5</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Review Form */}
                        <div className="lg:col-span-4">
                            <div className="bg-stone-50 p-10 rounded-3xl sticky top-32">
                                <h4 className="font-serif text-xl mb-6">{t('product.writeReview') || 'Partager votre avis'}</h4>
                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('product.rating') || 'Note'}</label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setUserRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={star <= userRating ? "#D4AF37" : "none"}
                                                        className={star <= userRating ? "text-[#D4AF37]" : "text-gray-200"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('product.yourReview') || 'Votre Commentaire'}</label>
                                        <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            className="w-full p-4 rounded-2xl border border-stone-200 bg-white focus:border-black outline-none min-h-[120px] transition-colors resize-none text-sm leading-relaxed"
                                            placeholder="Comment avez-vous trouvé ce produit ?"
                                        />

                                        {/* Image Upload UI */}
                                        <div className="mt-4">
                                            <div className="flex gap-2 mb-2 flex-wrap">
                                                {reviewImages.map((img, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                                        <Image src={img} alt="review" fill className="object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute top-0 right-0 p-1 bg-black/50 text-white hover:bg-red-500 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white transition-colors bg-gray-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        disabled={isUploading}
                                                    />
                                                    <span className="text-gray-400"><Camera size={20} /></span>
                                                </label>
                                            </div>
                                            <p className="text-[10px] text-gray-400 italic">Ajouter des photos (optionnel)</p>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="w-full py-4 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                                    >
                                        {isSubmittingReview ? "..." : (t('product.submitReview') || 'Publier l\'avis')}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-8 space-y-12">
                            {reviews.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <Star size={40} className="mx-auto text-gray-100 mb-4" />
                                    <p className="text-gray-400 font-serif italic">{t('product.noReviews') || 'Aucun avis pour le moment. Soyez le premier à commander et donner votre avis !'}</p>
                                </div>
                            ) : (
                                reviews.map((review: Review) => (
                                    <div key={review.id} className="group border-b border-gray-50 pb-12 last:border-0 hover:border-gray-100 transition-colors">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-stone-100 w-12 h-12 rounded-full flex items-center justify-center font-serif text-stone-500 shadow-inner">
                                                    {review.patient?.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-3">
                                                        {review.patient?.firstName} {review.patient?.lastName}
                                                        {review.isVerified && (
                                                            <span className="inline-flex items-center gap-1.5 text-[8px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] border border-green-100">
                                                                <Check size={10} /> {t('product.verified')}
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <span className="text-[10px] text-gray-300 font-medium uppercase tracking-tighter mt-1 block">{new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex text-[#D4AF37]">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "" : "text-gray-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-loose font-light text-sm italic pr-12 mb-4">&quot;{review.comment}&quot;</p>

                                        {/* Display Review Images */}
                                        {review.images && (
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {(() => {
                                                    try {
                                                        const imgs = JSON.parse(review.images);
                                                        if (Array.isArray(imgs)) {
                                                            return imgs.map((img: string, i: number) => (
                                                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform">
                                                                    <Image src={img} alt="review" fill className="object-cover" />
                                                                </div>
                                                            ));
                                                        }
                                                        return null;
                                                    } catch {
                                                        return null;
                                                    }
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Bag - LUXURY VERSION */}
            <div className="fixed bottom-[100px] left-4 right-4 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 p-4 lg:hidden z-40 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                <div className="flex flex-col pl-2">
                    <span className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] mb-0.5">{t('product.totalTTC')}</span>
                    <span className="text-xl font-serif text-white">{currentPrice.toFixed(2)}€</span>
                </div>
                <button
                    disabled={!canAddToCart}
                    onClick={() => addToCart({
                        id: product.id,
                        title: localizedName,
                        price: currentPrice,
                        image: displayImages[0],
                        variantId: selectedVariant?.id,
                        variantName: selectedVariant?.name,
                        taxRate: product.taxRate || 0
                    }, quantity)}
                    className={`px-8 py-3.5 rounded-full uppercase tracking-[0.2em] font-bold text-[10px] shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${canAddToCart
                        ? 'bg-[var(--honey-gold)] text-black hover:bg-[#D4AF37]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isOutOfStock ? (t('product.soldOut') || 'SOLDOUT') : (t('product.addToCart') || 'AJOUTER')}
                    <ShoppingBag size={14} />
                </button>
            </div>
            {/* Related Products Section */}
            <div className="bg-stone-50/50 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="mb-12">
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold">{t('product.suggestions')}</span>
                        <h2 className="text-4xl font-serif text-[var(--coffee-brown)] mt-4">{t('product.continueExploring')}</h2>
                    </div>
                    <BestSellers />
                </div>
            </div>

            <div className="pb-16">
                <NewArrivals />
            </div>
        </main>
    );
}
