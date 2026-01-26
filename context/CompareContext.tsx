"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    price: string | number;
    image: string;
    category: string;
    slug: string;
}

interface CompareContextType {
    compareItems: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: number) => void;
    clearCompare: () => void;
    isInCompare: (productId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareItems, setCompareItems] = useState<Product[]>([]);

    useEffect(() => {
        const savedCompare = localStorage.getItem('yemkaf_compare');
        if (savedCompare) {
            try {
                setCompareItems(JSON.parse(savedCompare));
            } catch (e) {
                console.error("Failed to parse compare items", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('yemkaf_compare', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product: Product) => {
        if (compareItems.find(item => item.id === product.id)) {
            removeFromCompare(product.id);
            return;
        }

        if (compareItems.length >= 4) {
            toast.error("You can only compare up to 4 products");
            return;
        }

        setCompareItems(prev => [...prev, product]);
        toast.success(`${product.name} added to comparison`);
    };

    const removeFromCompare = (productId: number) => {
        setCompareItems(prev => prev.filter(item => item.id !== productId));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    const isInCompare = (productId: number) => {
        return compareItems.some(item => item.id === productId);
    };

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
