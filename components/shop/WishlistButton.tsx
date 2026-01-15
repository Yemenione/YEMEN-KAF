"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface WishlistButtonProps {
    productId: number;
    className?: string;
    iconSize?: number;
}

export default function WishlistButton({ productId, className, iconSize = 16 }: WishlistButtonProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial check - in a real app would likely check a global wishlist context
    useEffect(() => {
        // Optimistically checking if we want to fetch initial state
        // For now, we default to false to save 12 API calls on load
    }, []);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            if (isWishlisted) {
                await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
                setIsWishlisted(false);
            } else {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId })
                });
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={clsx(
                "flex items-center justify-center transition-all",
                className
            )}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                className={clsx(
                    "transition-colors duration-300",
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700 hover:text-red-500"
                )}
            />
        </button>
    );
}
