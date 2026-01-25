"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export type CartItem = {
    id: string | number;
    variantId?: number;
    variantName?: string;
    title: string;
    price: string | number;
    image: string;
    quantity: number;
    taxRate?: number;
};

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (id: string | number, variantId?: number) => void;
    total: number;
    subtotal: number;
    taxTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const isInitialMount = useRef(true);
    const prevAuthRef = useRef(isAuthenticated);
    const { showToast } = useToast();

    // 1. Initial Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("cart_items");
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart items", e);
            }
        }
    }, []);

    // 2. Sync with Server on Auth Change
    useEffect(() => {
        const syncCart = async () => {
            if (isAuthenticated) {
                try {
                    const res = await fetch('/api/cart');
                    if (res.ok) {
                        const data = await res.json();
                        const serverItems: CartItem[] = data.items || [];

                        setItems(prev => {
                            const merged = [...serverItems];
                            prev.forEach(localItem => {
                                const exists = merged.find(i => i.id === localItem.id && i.variantId === localItem.variantId);
                                if (!exists) {
                                    merged.push(localItem);
                                }
                            });
                            return merged;
                        });
                    }
                } catch (error) {
                    console.error("Failed to sync cart", error);
                }
            }
        };

        if (isAuthenticated !== prevAuthRef.current) {
            syncCart();
            prevAuthRef.current = isAuthenticated;
        }
    }, [isAuthenticated]);

    // 3. Persist to LocalStorage and Server
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        localStorage.setItem("cart_items", JSON.stringify(items));

        const updateServer = async () => {
            if (isAuthenticated) {
                try {
                    await fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items }),
                    });
                } catch (error) {
                    console.error("Failed to update server cart", error);
                }
            }
        };

        const timer = setTimeout(updateServer, 1000);
        return () => clearTimeout(timer);
    }, [items, isAuthenticated]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const addToCart = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id && i.variantId === newItem.variantId);
            if (existing) {
                return prev.map((i) =>
                    (i.id === newItem.id && i.variantId === newItem.variantId)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...newItem, quantity }];
        });
        setIsOpen(true);
        showToast(`${newItem.title} ${newItem.variantName ? `(${newItem.variantName})` : ''} added to cart!`, "success");
    };

    const removeFromCart = (id: string | number, variantId?: number) => {
        const item = items.find((i) => i.id === id && i.variantId === variantId);
        setItems((prev) => prev.filter((i) => !(i.id === id && i.variantId === variantId)));
        if (item) {
            showToast(`${item.title} removed from cart`, "info");
        }
    };

    const parsePrice = (price: string | number) => {
        if (typeof price === 'number') return price;
        return parseFloat(price.replace(/[^0-9.]/g, ""));
    };

    const { total, subtotal, taxTotal } = items.reduce((acc, item) => {
        const priceTTC = parsePrice(item.price);
        const lineTotalTTC = priceTTC * item.quantity;
        const taxRate = item.taxRate || 0;
        const priceHT = priceTTC / (1 + taxRate / 100);
        const lineTotalHT = priceHT * item.quantity;
        const lineTax = lineTotalTTC - lineTotalHT;

        return {
            total: acc.total + lineTotalTTC,
            subtotal: acc.subtotal + lineTotalHT,
            taxTotal: acc.taxTotal + lineTax
        };
    }, { total: 0, subtotal: 0, taxTotal: 0 });

    return (
        <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addToCart, removeFromCart, total, subtotal, taxTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
