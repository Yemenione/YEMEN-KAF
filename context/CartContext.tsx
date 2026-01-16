"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/context/ToastContext";

export type CartItem = {
    id: string | number;
    title: string;
    price: string | number;
    image: string;
    quantity: number;
};

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string | number) => void;
    total: number;
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
            const existing = prev.find((i) => i.id === newItem.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
        setIsOpen(true);
        showToast(`${newItem.title} added to cart!`, "success");
    };

    const removeFromCart = (id: string | number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    // Helper to parse "$180.00" -> 180.00 or handle numbers
    const parsePrice = (price: string | number) => {
        if (typeof price === 'number') return price;
        return parseFloat(price.replace(/[^0-9.]/g, ""));
    };

    const total = items.reduce((acc, item) => acc + parsePrice(item.price) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addToCart, removeFromCart, total }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
