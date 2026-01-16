"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
    wishlistCount: number;
    wishlistIds: number[];
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (productId: number) => Promise<void>;
    loading: boolean;
    isOpen: boolean;
    openWishlist: () => void;
    closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const openWishlist = () => setIsOpen(true);
    const closeWishlist = () => setIsOpen(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlistIds();
        } else {
            // Load from local storage
            const stored = localStorage.getItem('guest_wishlist');
            if (stored) {
                try {
                    setWishlistIds(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse guest wishlist", e);
                    setWishlistIds([]);
                }
            } else {
                setWishlistIds([]);
            }
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
        // Optimistic update
        const isCurrentlyIn = isInWishlist(productId);
        const originalIds = [...wishlistIds];

        let newIds;
        if (isCurrentlyIn) {
            newIds = wishlistIds.filter(id => id !== productId);
        } else {
            newIds = [...wishlistIds, productId];
        }
        setWishlistIds(newIds);

        if (!isAuthenticated) {
            // Guest mode: Save to local storage
            localStorage.setItem('guest_wishlist', JSON.stringify(newIds));
            showToast(isCurrentlyIn ? 'Removed from wishlist' : 'Added to wishlist', 'success');
            return;
        }

        // Authenticated mode: Sync with server
        try {
            const body = isCurrentlyIn ? undefined : JSON.stringify({ productId });

            let res;
            if (isCurrentlyIn) {
                // Determine if API supports query param for delete or body
                // Base on previous code: fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
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
            showToast(isCurrentlyIn ? 'Removed from wishlist' : 'Added to wishlist', 'success');
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
            loading,
            isOpen,
            openWishlist,
            closeWishlist
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
