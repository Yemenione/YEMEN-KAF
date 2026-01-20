"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Check, Shield, ArrowLeft } from "lucide-react";
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
}

interface Review {
    id: number;
    rating: number;
    comment: string;
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

export default function ProductDetails({ product, carriers = [] }: { product: Product, carriers?: Carrier[] }) {
    const { addToCart } = useCart();
    const { t, language } = useLanguage();

    // State
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${product.slug}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: userRating, comment: userComment })
            });

            if (res.ok) {
                const newReview = await res.json();
                setReviews([newReview, ...reviews]);
                setUserComment("");
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
        <main className="min-h-screen bg-gray-50 pt-28">
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-black transition-colors">{t('nav.home')}</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-black transition-colors">{t('nav.shop')}</Link>
                        <span>/</span>
                        <span className="text-black">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="hidden lg:block relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            <Image src={mainImage} alt={product.name} fill className="object-cover" priority sizes="(min-width: 1024px) 50vw, 100vw" />
                            {discountPercentage && (
                                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 font-bold text-sm rounded-full shadow-xl z-10 uppercase tracking-wider">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>
                        <div className="lg:hidden relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide">
                                {displayImages.map((img: string, idx: number) => (
                                    <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
                                        <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" priority={idx === 0} sizes="100vw" />
                                    </div>
                                ))}
                            </div>
                            {discountPercentage && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 font-bold text-sm rounded-full shadow-md z-10">
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
                                            alt={`${product.name} ${idx + 1}`}
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
                                {product.category_name}
                            </h2>
                            <h1 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight font-medium tracking-tight">{product.name}</h1>

                            {/* Star Rating Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex text-[#D4AF37]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={18} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "" : "text-gray-200"} />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-gray-400 tracking-wider">({totalReviews} {t('product.reviews') || 'AVIS'})</span>
                            </div>

                            <div className="flex items-baseline gap-6 mb-8">
                                <span className="text-4xl font-light text-black tracking-tight">{currentPrice.toFixed(2)}€</span>
                                {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                                    <span className="text-xl text-gray-300 line-through decoration-gray-300/50 font-light">{currentCompareAtPrice.toFixed(2)}€</span>
                                )}
                            </div>
                            <div className="prose prose-stone prose-sm text-gray-600 leading-relaxed mb-8 max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
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

                                                const isColorAttr = ['color', 'couleur', 'colour', 'lon', 'teinte'].includes(attrName.toLowerCase());
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
                                                            ? `w-14 h-14 rounded-full p-1 ${isSelected ? 'ring-2 ring-black ring-offset-4 scale-110' : 'ring-1 ring-gray-100 hover:ring-gray-300'}`
                                                            : `px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest ${isSelected ? 'border-black bg-black text-white shadow-xl' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-black'}`
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
                            <button
                                disabled={!canAddToCart}
                                onClick={() => addToCart({
                                    id: product.id,
                                    title: product.name,
                                    price: currentPrice,
                                    image: displayImages[0],
                                    variantId: selectedVariant?.id,
                                    variantName: selectedVariant?.name,
                                    taxRate: product.taxRate || 0
                                }, quantity)}
                                className={`flex-1 py-5 rounded-full uppercase tracking-[0.2em] font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all duration-500 ${canAddToCart
                                    ? 'bg-black text-white hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <ShoppingBag className="w-4 h-4" /> {canAddToCart ? (t('product.addToBag') || 'Ajouter au Panier') : (t('product.outOfStock') || 'RUPTURE DE STOCK')}
                            </button>
                            <button className="p-5 border border-gray-100 rounded-full hover:border-black transition-all bg-white shadow-sm group">
                                <Heart className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>

                        {/* Logistics & Security Section */}
                        <div className="mt-8 space-y-10 border-t border-gray-100 pt-12">
                            {/* French Logistics - DYNAMIC */}
                            {carriers.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-8 border-l-2 border-black pl-4">{t('product.certifiedShipping')}</h4>
                                    <div className="flex flex-wrap items-center gap-10">
                                        {carriers.map((carrier) => (
                                            <div key={carrier.id} className="flex flex-col items-center gap-3 group">
                                                <div className="h-10 w-28 relative grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500">
                                                    {carrier.logo ? (
                                                        <Image src={carrier.logo} alt={carrier.name} fill className="object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                                                            {carrier.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">{carrier.deliveryTime || "48h-72h"}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-6 text-[10px] text-gray-400 font-medium italic opacity-60 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        {t('product.secureDelivery')}
                                    </p>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <Shield size={20} className="text-black" />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em]">{t('product.authenticity')}</h5>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">{t('product.authenticityDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <Check size={20} className="text-black" />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em]">{t('product.qualityControl')}</h5>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">{t('product.qualityControlDesc')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Secure Payment */}
                            <div className="pt-6 text-center">
                                <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-300 mb-6">{t('product.securePayment')}</h4>
                                <div className="flex justify-center items-center gap-8 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                                    <div className="h-4 w-10 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" fill className="object-contain" /></div>
                                    <div className="h-6 w-10 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" fill className="object-contain" /></div>
                                    <div className="h-5 w-12 relative"><Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" fill className="object-contain" /></div>
                                    <div className="text-[9px] font-black border-2 border-gray-200 px-2 rounded-md text-gray-300 uppercase leading-none py-1">CB</div>
                                </div>
                            </div>
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
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="mt-32 border-t border-gray-100 pt-20">
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
                                        <div className="flex gap-3">
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
                                            className="w-full p-4 rounded-2xl border border-stone-200 bg-white focus:border-black outline-none min-h-[150px] transition-colors resize-none text-sm leading-relaxed"
                                            placeholder="Comment avez-vous trouvé ce produit ?"
                                        ></textarea>
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
                                        <p className="text-gray-600 leading-loose font-light text-sm italic pr-12">&quot;{review.comment}&quot;</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Bag - LUXURY VERSION */}
            <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-6 lg:hidden z-40 safe-area-pb shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
                <div className="flex gap-6 items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">{t('product.totalTTC')}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-light text-black tracking-tighter">{currentPrice.toFixed(2)}€</span>
                        </div>
                    </div>
                    <button
                        disabled={!canAddToCart}
                        onClick={() => addToCart({
                            id: product.id,
                            title: product.name,
                            price: currentPrice,
                            image: displayImages[0],
                            variantId: selectedVariant?.id,
                            variantName: selectedVariant?.name,
                            taxRate: product.taxRate || 0
                        }, quantity)}
                        className={`flex-1 py-4 rounded-full uppercase tracking-[0.2em] font-bold text-xs shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 ${canAddToCart
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        {isOutOfStock ? (t('product.soldOut') || 'SOLDOUT') : (t('product.addToCart') || 'PANIER')}
                        <ShoppingBag size={14} />
                    </button>
                </div>
            </div>
            {/* Related Products Section */}
            <div className="bg-stone-50/50 mt-32">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="mb-12">
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold">{t('product.suggestions')}</span>
                        <h2 className="text-4xl font-serif text-[var(--coffee-brown)] mt-4">{t('product.continueExploring')}</h2>
                    </div>
                    <BestSellers />
                </div>
            </div>

            <div className="pb-32">
                <NewArrivals />
            </div>
        </main >
    );
}
