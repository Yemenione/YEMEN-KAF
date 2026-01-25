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
    const [isOpen, setIsOpen] = useState(false);

    const openWishlist = () => setIsOpen(true);
    const closeWishlist = () => setIsOpen(false);

    useEffect(() => {
        const syncWishlist = async () => {
            if (isAuthenticated) {
                // 1. Fetch server wishlist
                await fetchWishlistIds();

                // 2. Merge guest wishlist into server
                const storedGuest = localStorage.getItem('guest_wishlist');
                if (storedGuest) {
                    try {
                        const guestIds: number[] = JSON.parse(storedGuest);
                        // Filter for items not already in server wishlist
                        const toAdd = guestIds.filter(id => !wishlistIds.includes(id));

                        for (const productId of toAdd) {
                            await fetch('/api/wishlist', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId })
                            });
                        }

                        if (toAdd.length > 0) {
                            fetchWishlistIds(); // Refresh again
                        }

                        // Clear guest wishlist after sync
                        localStorage.removeItem('guest_wishlist');
                    } catch (e) {
                        console.error("Failed to merge guest wishlist", e);
                    }
                }
            } else {
                // Load from local storage for guests
                const stored = localStorage.getItem('guest_wishlist');
                if (stored) {
                    try {
                        setWishlistIds(JSON.parse(stored));
                    } catch (e) {
                        setWishlistIds([]);
                    }
                } else {
                    setWishlistIds([]);
                }
            }
        };

        syncWishlist();
    }, [isAuthenticated]);

    const fetchWishlistIds = async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                // Assuming the API returns the full product objects in 'wishlist' array
                // We just map to IDs
                if (Array.isArray(data.wishlist)) {
                    const ids = data.wishlist.map((item: { id: number }) => item.id);
                    setWishlistIds(ids);
                }
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

            loading: false, // Defaulting to false since state was removed
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
