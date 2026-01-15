"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistCount: number;
    wishlistIds: number[];
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (productId: number) => Promise<void>;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlistIds();
        } else {
            setWishlistIds([]);
        }
    }, [isAuthenticated]);

    const fetchWishlistIds = async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                // Assuming the API returns the full product objects in 'wishlist' array
                // We just map to IDs
                const ids = (data.wishlist as any[]).map((item: any) => item.id);
                setWishlistIds(ids);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist ids", error);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistIds.includes(productId);
    };

    const toggleWishlist = async (productId: number) => {
        if (!isAuthenticated) return;

        // Optimistic update
        const isCurrentlyIn = isInWishlist(productId);
        const originalIds = [...wishlistIds];

        if (isCurrentlyIn) {
            setWishlistIds(prev => prev.filter(id => id !== productId));
        } else {
            setWishlistIds(prev => [...prev, productId]);
        }

        try {
            const method = isCurrentlyIn ? 'DELETE' : 'POST';
            const body = isCurrentlyIn ? undefined : JSON.stringify({ productId });
            // For DELETE we need query param, for POST we used body in previous implementation
            // Checking route.ts: 
            // POST expects body { productId }
            // DELETE expects query param ?productId=...

            let res;
            if (isCurrentlyIn) {
                res = await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
            } else {
                res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });
            }

            if (!res.ok) {
                throw new Error("Failed to toggle");
            }
        } catch (error) {
            console.error("Error toggling wishlist", error);
            // Revert on error
            setWishlistIds(originalIds);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistCount: wishlistIds.length,
            wishlistIds,
            isInWishlist,
            toggleWishlist,
            loading
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
