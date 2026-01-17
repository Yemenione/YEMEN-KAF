"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Save, AlertCircle } from "lucide-react";

interface Attribute {
    id: number;
    name: string;
    publicName: string | null;
    values: { id: number; name: string; value: string }[];
}

interface Variant {
    id?: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    attributes: { attributeId: number; valueId: number }[];
}

export default function ProductVariantsManager({ productId, basePrice, baseSku }: { productId: number, basePrice: number, baseSku: string }) {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedAttrs, setSelectedAttrs] = useState<number[]>([]); // IDs of attributes to use
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchAttributes();
        fetchVariants();
    }, [productId]);

    const fetchAttributes = async () => {
        const res = await fetch('/api/admin/attributes');
        if (res.ok) setAttributes(await res.json());
    };

    const fetchVariants = async () => {
        const res = await fetch(`/api/admin/products/${productId}/variants`);
        if (res.ok) setVariants(await res.json());
    };

    const handleGenerate = () => {
        if (selectedAttrs.length === 0) return alert("Select at least one attribute");
        setGenerating(true);

        // Filter full attribute objects
        const activeAttributes = attributes.filter(a => selectedAttrs.includes(a.id));

        // Helper to generate combinations
        const combine = (acc: any[], idx: number): any[] => {
            if (idx === activeAttributes.length) return acc;

            const attr = activeAttributes[idx];
            const nextAcc = [];

            if (acc.length === 0) {
                // First attribute values
                nextAcc.push(...attr.values.map(v => ({
                    name: v.name,
                    skuPart: v.name.toUpperCase().slice(0, 3),
                    attrs: [{ attributeId: attr.id, valueId: v.id }]
                })));
            } else {
                // Cross product
                for (const existing of acc) {
                    for (const v of attr.values) {
                        nextAcc.push({
                            name: `${existing.name} - ${v.name}`,
                            skuPart: `${existing.skuPart}-${v.name.toUpperCase().slice(0, 3)}`,
                            attrs: [...existing.attrs, { attributeId: attr.id, valueId: v.id }]
                        });
                    }
                }
            }
            return combine(nextAcc, idx + 1);
        };

        const combinations = combine([], 0);

        // Convert to Variant objects
        const newVariants: Variant[] = combinations.map(c => ({
            name: c.name,
            sku: `${baseSku}-${c.skuPart}`,
            price: basePrice,
            stock: 0,
            isActive: true,
            attributes: c.attrs
        }));

        // Merge with existing? For now, just append or alert
        if (variants.length > 0) {
            if (!confirm("This will append new variants. Continue?")) {
                setGenerating(false);
                return;
            }
        }

        setVariants([...variants, ...newVariants]);
        setGenerating(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}/variants`, {
                method: 'POST', // Bulk replace/update
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variants })
            });

            if (res.ok) {
                alert("Variants saved successfully!");
                fetchVariants();
            } else {
                alert("Failed to save variants");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving variants");
        } finally {
            setLoading(false);
        }
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const updated = [...variants];
        // @ts-ignore
        updated[index][field] = value;
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <RefreshCw size={18} /> Variant Generator
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Attributes to Generate From:</label>
                        <div className="flex flex-wrap gap-3">
                            {attributes.map(attr => (
                                <label key={attr.id} className={`cursor-pointer px-3 py-2 border rounded-lg text-sm transition-colors ${selectedAttrs.includes(attr.id) ? 'bg-[var(--coffee-brown)] text-white border-[var(--coffee-brown)]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedAttrs.includes(attr.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedAttrs([...selectedAttrs, attr.id]);
                                            else setSelectedAttrs(selectedAttrs.filter(id => id !== attr.id));
                                        }}
                                    />
                                    {attr.publicName || attr.name} ({attr.values.length})
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating || selectedAttrs.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                        Generate Combinations
                    </button>

                    <p className="text-xs text-gray-500">
                        Select attributes (e.g., Color, Size) to automatically create all possible combinations.
                    </p>
                </div>
            </div>

            {variants.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                        <h3 className="font-semibold">Variants ({variants.length})</h3>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Variant Name</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3 w-32">Price (€)</th>
                                    <th className="px-4 py-3 w-32">Stock</th>
                                    <th className="px-4 py-3 w-24">Active</th>
                                    <th className="px-4 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {variants.map((variant, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-4 py-2 font-medium">{variant.name}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1 py-1"
                                                value={variant.sku}
                                                onChange={e => updateVariant(index, 'sku', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 focus:border-blue-500"
                                                value={variant.price}
                                                onChange={e => updateVariant(index, 'price', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 focus:border-blue-500"
                                                value={variant.stock}
                                                onChange={e => updateVariant(index, 'stock', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={variant.isActive}
                                                onChange={e => updateVariant(index, 'isActive', e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => removeVariant(index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
