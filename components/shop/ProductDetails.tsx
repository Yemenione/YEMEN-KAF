"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Check, Shield, ArrowLeft, ChevronDown, Clock, Flame, Share2, Facebook, Copy, MapPin, Camera, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import BestSellers from "./BestSellers";
import NewArrivals from "./NewArrivals";

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
    const { t, language, getLocalizedValue } = useLanguage();

    // Localized Strings
    const localizedName = getLocalizedValue(product, 'name');
    const localizedDescription = getLocalizedValue(product, 'description');

    // Construct a pseudo-category object for translation if needed
    const categoryObj = { name: product.category_name, translations: product.category_translations };
    const localizedCategoryName = getLocalizedValue(categoryObj, 'name');

    // State
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
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

    // Images logic
    const getImages = () => {
        if (!product.images) return ['/images/honey-jar.jpg'];
        try {
            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images : ['/images/honey-jar.jpg'];
            }

            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return [product.images];
            }
            const parsed = JSON.parse(product.images as string);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
            if (typeof product.images === 'string' && product.images.length > 0) return [product.images];
        }
        return ['/images/honey-jar.jpg'];
    };

    const productImages = getImages();

    // Variants logic
    const hasVariants = product.variants && product.variants.length > 0;
    const attributes = hasVariants ? product.variants.reduce((acc: Record<string, Set<string>>, variant: ProductVariant) => {
        variant.attributes.forEach((attr: VariantAttribute) => {
            if (!acc[attr.name]) acc[attr.name] = new Set();
            acc[attr.name].add(attr.value);
        });
        return acc;
    }, {}) : {};

    const attributeNames = Object.keys(attributes);

    const selectedVariant = hasVariants ? product.variants.find((v: ProductVariant) => {
        return v.attributes.every((attr: VariantAttribute) => selectedOptions[attr.name] === attr.value);
    }) : null;

    useEffect(() => {
        if (selectedVariant?.id) {
            setSelectedImage(0);
        }
    }, [selectedVariant?.id]);

    const getVariantImages = (variant: ProductVariant) => {
        if (!variant || !variant.images) return null;
        try {
            if (Array.isArray(variant.images)) return variant.images;
            if (typeof variant.images === 'string') {
                const parsed = JSON.parse(variant.images);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                return [variant.images];
            }
            return null;
        } catch {
            return typeof variant.images === 'string' ? [variant.images] : null;
        }
    };

    const variantImages = selectedVariant ? getVariantImages(selectedVariant) : null;
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                        {t('product.details') || "DÉTAILS DU PRODUIT"}
                    </span>
                    <button className="p-2 -mr-2 text-black">
                        <Heart size={20} />
                    </button>
                </div>

                {/* Product Image Card - Floating Style */}
                <div className="mx-4 mb-6">
                    <div className="relative w-full aspect-[4/5] bg-[#F9F6F1] rounded-[2.5rem] overflow-hidden shadow-sm">
                        <Image
                            src={mainImage}
                            alt={localizedName}
                            fill
                            className="object-cover"
                            priority
                            sizes="90vw"
                        />
                        {discountPercentage && (
                            <div className="absolute bottom-6 left-6 bg-[#D4AF37] text-white px-3 py-1 font-bold text-[10px] rounded-full shadow-md uppercase tracking-wider">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8">
                    {/* Title & Origin - Tight Spacing */}
                    <div className="mb-4">
                        <h1 className="text-3xl font-serif text-black italic mb-1 leading-tight">
                            {localizedName}
                        </h1>
                        <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                            {t('product.origin') || "ORIGINE"}: {product.origin_country || "BANI MATAR, YÉMEN"}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium tracking-widest mt-0.5">
                            Altitude: 2000m - 2400m
                        </p>
                    </div>

                    {/* Description - Concise */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            {localizedDescription ? localizedDescription.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : product.description?.substring(0, 150) + "..."}
                        </p>
                    </div>

                    {/* Tasting Notes */}
                    <div className="mb-6">
                        <span className="block text-[9px] font-extrabold text-gray-300 uppercase tracking-widest mb-2">
                            {t('product.tastingNotes') || "NOTES DE DÉGUSTATION"}
                        </span>
                        <div className="flex gap-2 bg-[#F9F6F1] p-1 rounded-full w-max">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                                <span className="text-xs">🍫</span>
                                <span className="text-[10px] font-bold text-[var(--coffee-brown)] uppercase tracking-wide">Chocolat Noir</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                                <span className="text-xs">🍒</span>
                                <span className="text-[10px] font-bold text-[var(--coffee-brown)] uppercase tracking-wide">Fruits Rouges</span>
                            </div>
                        </div>
                    </div>

                    {/* Variants Control */}
                    {hasVariants && (
                        <div className="space-y-5 mb-6">
                            {attributeNames.map((attrName) => (
                                <div key={attrName}>
                                    <label className="block text-[9px] font-extrabold text-gray-300 uppercase tracking-widest mb-2">
                                        {attrName}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(attributes[attrName] as Set<string>).map((value) => {
                                            const isSelected = selectedOptions[attrName] === value;
                                            const strValue = String(value);
                                            return (
                                                <button
                                                    key={strValue}
                                                    onClick={() => handleOptionSelect(attrName, strValue)}
                                                    className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isSelected
                                                        ? 'bg-[#E3C069] text-white shadow-md'
                                                        : 'bg-white border border-gray-100 text-gray-400'
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

                    {/* Quantity Selector */}
                    <div className="mb-4">
                        <span className="block text-[9px] font-extrabold text-gray-300 uppercase tracking-widest mb-2">
                            {t('product.quantity') || "QUANTITÉ"}
                        </span>
                        <div className="flex gap-4">
                            <div className="flex-1 border border-gray-200 rounded-full h-12 flex items-center justify-between px-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 text-lg pb-1"
                                >
                                    -
                                </button>
                                <span className="font-bold text-sm">{quantity}g</span>
                                <button
                                    onClick={() => {
                                        const stock = selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? product.quantity ?? 10;
                                        setQuantity(Math.min(stock, quantity + 1));
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 text-lg pb-1"
                                >
                                    +
                                </button>
                            </div>
                            <button className="flex-1 border border-[#E3C069] text-[#E3C069] rounded-full h-12 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">
                                500g
                            </button>
                        </div>
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
                                                        const vImages = getVariantImages(textVariant);
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
                            <button className="hidden lg:block p-5 border border-gray-100 rounded-full hover:border-black transition-all bg-white shadow-sm group">
                                <Heart className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
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
            <div className="fixed bottom-20 left-4 right-4 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 p-4 lg:hidden z-40 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
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
