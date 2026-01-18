"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/context/ToastContext";

export type CartItem = {
    id: string | number;
    variantId?: number;
    variantName?: string;
    title: string;
    price: string | number;
    image: string;
    quantity: number;
    taxRate?: number; // Added taxRate
};

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string | number, variantId?: number) => void;
    total: number;
    subtotal: number;
    taxTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const { showToast } = useToast();

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id && i.variantId === newItem.variantId);
            if (existing) {
                return prev.map((i) =>
                    (i.id === newItem.id && i.variantId === newItem.variantId)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
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

    // Helper to parse "$180.00" -> 180.00 or handle numbers
    const parsePrice = (price: string | number) => {
        if (typeof price === 'number') return price;
        return parseFloat(price.replace(/[^0-9.]/g, ""));
    };

    // Calculate Totals (Assuming Price is TTC/Tax Included)
    const { total, subtotal, taxTotal } = items.reduce((acc, item) => {
        const priceTTC = parsePrice(item.price);
        const lineTotalTTC = priceTTC * item.quantity;
        const taxRate = item.taxRate || 0;

        // Calculate HT (Hors Taxe)
        // priceTTC = priceHT * (1 + rate/100)
        // priceHT = priceTTC / (1 + rate/100)
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
