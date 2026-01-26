import { useState } from "react";
import Image from "next/image";
import { Plus, Heart, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface ProductCardProps {
    id?: number;
    title: string;
    price: string;
    startingPrice?: string;
    compareAtPrice?: string;
    image: string;
    category: string;
    colors?: string[];
    hasVariants?: boolean;
    variantCount?: number;
    layout?: 'grid' | 'list';
}

export default function ProductCard({
    id,
    title,
    price,
    startingPrice,
    compareAtPrice,
    image,
    category,
    colors = [],
    hasVariants = false,
    layout = 'grid'
}: ProductCardProps) {
    const { isAuthenticated } = useAuth();
    const { t, locale } = useLanguage();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { addToCompare, isInCompare } = useCompare();
    const { addToCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isWishlisted = id ? isInWishlist(id) : false;
    const isCompared = id ? isInCompare(id) : false;

    // Calculate Discount
    const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
    const numericComparePrice = compareAtPrice ? parseFloat(compareAtPrice.replace(/[^\d.]/g, '')) : null;
    const hasDiscount = !!(numericComparePrice && numericComparePrice > numericPrice);
    const discountPercentage = hasDiscount
        ? Math.round(((numericComparePrice! - numericPrice) / numericComparePrice!) * 100)
        : null;

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!id) return;

        setLoading(true);
        try {
            await toggleWishlist(id);
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompareToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!id) return;

        addToCompare({
            id,
            name: title,
            price: numericPrice,
            image,
            category,
            slug: title.toLowerCase().replace(/ /g, '-'), // Approximation, slug props wasn't passed but we can fix if needed
        });
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants || !id) {
            router.push(`/shop/${id}`);
            return;
        }

        addToCart({
            id,
            title,
            price: numericPrice,
            image,
        });
    };

    if (layout === 'list') {
        return (
            <div className="group relative w-full bg-white rounded-2xl border border-black/5 flex flex-row overflow-hidden hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                {/* Image Section */}
                <div className="relative w-48 sm:w-64 aspect-square overflow-hidden bg-[#F9F6F1]">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    {hasDiscount && (
                        <div className="absolute top-3 start-3 bg-red-600 text-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg z-10">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                {category}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCompareToggle}
                                    title={t('shop.compare')}
                                    className={clsx(
                                        "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                        isCompared ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
                                    )}
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={handleWishlistToggle}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 group-hover:text-[var(--coffee-brown)] transition-colors">
                            {title}
                        </h3>

                        {colors.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                {colors.slice(0, 6).map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-4 h-4 rounded-full border border-black/5 shadow-inner ring-1 ring-transparent hover:ring-black/20 transition-all cursor-pointer"
                                        style={{ backgroundColor: color.startsWith('#') || color.startsWith('rgb') ? color : '#ddd' }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            {hasVariants && (
                                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                    {t('product.startingAt') || (locale === 'fr' ? 'À partir de' : 'From')}
                                </p>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-black">
                                    {startingPrice ? `€${Number(startingPrice).toFixed(2)}` : price}
                                </span>
                                {hasDiscount && !hasVariants && (
                                    <span className="text-sm text-gray-400 line-through decoration-red-400/30">
                                        {compareAtPrice}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleQuickAdd}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[var(--coffee-brown)] transition-all shadow-lg hover:shadow-black/20"
                        >
                            <Plus size={16} /> {t('shop.addToCart')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative w-full cursor-pointer overflow-hidden animate-in fade-in duration-700">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F9F6F1] rounded-xl md:rounded-2xl mb-2 md:mb-4">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />

                {/* Badges */}
                <div className="absolute top-2 start-2 flex flex-col gap-1.5 z-10">
                    <span className="inline-block px-2 py-1 text-[8px] uppercase tracking-widest bg-[#E3C069] text-black font-black rounded-md shadow-sm">
                        {hasVariants ? 'RARE' : (String(category) !== '0' ? category : '')}
                    </span>
                    {hasDiscount && (discountPercentage ?? 0) > 0 && (
                        <span className="inline-block px-1.5 py-0.5 text-[8px] uppercase tracking-widest bg-red-600 text-white font-bold rounded-md shadow-sm self-start">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Top Action Buttons (Wishlist & Compare) */}
                <div className="absolute top-2 end-2 z-20 flex flex-col gap-2">
                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistToggle}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-sm group/wish"
                    >
                        <Heart
                            size={16}
                            className={clsx(
                                "transition-all duration-300",
                                isWishlisted ? "fill-black text-black scale-110" : "text-black group-hover/wish:text-gray-600"
                            )}
                        />
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={handleCompareToggle}
                        className={clsx(
                            "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-sm",
                            isCompared ? "bg-black text-white" : "bg-white/90 hover:bg-white text-black group-hover:opacity-100"
                        )}
                        title={t('shop.compare')}
                    >
                        <RefreshCw size={14} className={isCompared ? "animate-spin-slow" : ""} />
                    </button>
                </div>

                {/* 'Quick Add' Button */}
                <button
                    onClick={handleQuickAdd}
                    className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-8 h-8 md:w-10 md:h-10 bg-black text-white flex items-center justify-center rounded-full shadow-lg z-20 hover:scale-110 transition-transform duration-300"
                >
                    <Plus size={16} className="md:w-[20px] md:h-[20px]" />
                </button>
            </div>

            {/* Content - Compact for Mobile */}
            <div className="px-1 space-y-1 md:space-y-2 text-start md:text-center">

                <h3 className="text-sm md:text-lg font-bold text-black leading-tight line-clamp-1 group-hover:text-[var(--coffee-brown)] transition-colors">
                    {title}
                </h3>
                {/* Subtitle / Notes mock */}
                <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium line-clamp-1">
                    {category} • Excellence
                </p>

                <div className="flex flex-row md:flex-col items-start md:items-center justify-between md:justify-center gap-1 mt-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm md:text-lg font-bold text-[#E3C069] tracking-tight">
                            {startingPrice ? `€${Number(startingPrice).toFixed(2)}` : price}
                        </span>
                        {hasDiscount && !hasVariants && compareAtPrice && (
                            <span className="text-[10px] md:text-sm text-gray-300 line-through tracking-tight">
                                {compareAtPrice}
                            </span>
                        )}
                    </div>
                </div>

                {/* Color Swatches - Hide on mobile if too many, or keep small */}
                {colors.length > 0 && (
                    <div className="hidden md:flex items-center justify-center gap-1.5 mb-2.5">
                        {colors.slice(0, 4).map((color, idx) => (
                            <div
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-black/5 shadow-inner ring-1 ring-transparent hover:ring-black/20 transition-all cursor-pointer"
                                style={{ backgroundColor: color.startsWith('#') || color.startsWith('rgb') ? color : '#ddd' }}
                                title={color}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
