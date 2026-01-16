"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ProductVariant {
    id: string;
    name: string;
    value: string;
    price?: number;
    stock?: number;
    weight?: number;
}

interface ProductVariantSelectorProps {
    variants: {
        name: string; // e.g., "Size", "Color"
        options: ProductVariant[];
    }[];
    onVariantChange?: (selected: Record<string, ProductVariant>) => void;
}

export default function ProductVariantSelector({ variants, onVariantChange }: ProductVariantSelectorProps) {
    const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

    const handleSelect = (variantName: string, option: ProductVariant) => {
        const newSelection = {
            ...selectedVariants,
            [variantName]: option
        };
        setSelectedVariants(newSelection);
        onVariantChange?.(newSelection);
    };

    if (!variants || variants.length === 0) return null;

    return (
        <div className="space-y-6">
            {variants.map((variant) => (
                <div key={variant.name} className="space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-gray-700">
                        {variant.name}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {variant.options.map((option) => {
                            const isSelected = selectedVariants[variant.name]?.id === option.id;
                            const isOutOfStock = option.stock !== undefined && option.stock <= 0;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !isOutOfStock && handleSelect(variant.name, option)}
                                    disabled={isOutOfStock}
                                    className={`
                                        relative px-6 py-3 border-2 rounded-lg font-semibold transition-all
                                        ${isSelected
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }
                                        ${isOutOfStock
                                            ? 'opacity-40 cursor-not-allowed line-through'
                                            : 'cursor-pointer'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{option.value}</span>
                                        {option.price && (
                                            <span className="text-xs text-gray-500">
                                                {option.price > 0 ? `+€${option.price.toFixed(2)}` : ''}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Selected Summary */}
            {Object.keys(selectedVariants).length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Selected Options:</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedVariants).map(([name, option]) => (
                            <span key={name} className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                                <span className="font-bold">{name}:</span> {option.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
