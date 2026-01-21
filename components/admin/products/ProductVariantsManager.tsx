"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Save } from "lucide-react";
import Image from "next/image";

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
    images?: string | null; // JSON string of array
    attributes: { attributeId: number; valueId: number }[];
}


interface ProductVariantsManagerProps {
    productId?: number;
    basePrice: number;
    baseSku: string;
    initialVariants?: Variant[];
    onChange?: (variants: Variant[]) => void;
}

export default function ProductVariantsManager({ productId, basePrice, baseSku, initialVariants = [], onChange }: ProductVariantsManagerProps) {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedAttrs, setSelectedAttrs] = useState<number[]>([]);
    const [variants, setVariants] = useState<Variant[]>(initialVariants);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchAttributes();
        if (productId && !initialVariants.length) {
            fetchVariants();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    // Propagate changes to parent
    useEffect(() => {
        if (onChange) {
            onChange(variants);
        }
    }, [variants, onChange]);

    const fetchAttributes = async () => {
        const res = await fetch('/api/admin/attributes');
        if (res.ok) setAttributes(await res.json());
    };

    const fetchVariants = async () => {
        if (!productId) return;
        const res = await fetch(`/api/admin/products/${productId}/variants`);
        if (res.ok) setVariants(await res.json());
    };

    const handleGenerate = () => {
        if (selectedAttrs.length === 0) return alert("Select at least one attribute");
        setGenerating(true);

        // ... (existing logic)
        // Define type for variant combination being built
        type Combination = {
            name: string;
            skuPart: string;
            attrs: { attributeId: number; valueId: number; value: string }[];
        };

        const activeAttributes = attributes.filter(a => selectedAttrs.includes(a.id));

        const combine = (acc: Combination[], idx: number): Combination[] => {
            if (idx === activeAttributes.length) return acc;
            const attr = activeAttributes[idx];
            const nextAcc: Combination[] = [];

            if (acc.length === 0) {
                nextAcc.push(...attr.values.map(v => ({
                    name: v.name,
                    skuPart: v.name.toUpperCase().slice(0, 3),
                    attrs: [{ attributeId: attr.id, valueId: v.id, value: v.value }]
                })));
            } else {
                for (const existing of acc) {
                    for (const v of attr.values) {
                        nextAcc.push({
                            name: `${existing.name} - ${v.name}`,
                            skuPart: `${existing.skuPart}-${v.name.toUpperCase().slice(0, 3)}`,
                            attrs: [...existing.attrs, { attributeId: attr.id, valueId: v.id, value: v.value }]
                        });
                    }
                }
            }
            return combine(nextAcc, idx + 1);
        };

        const combinations = combine([], 0);

        const newVariants: Variant[] = combinations.map(c => ({
            name: c.name,
            sku: `${baseSku}-${c.skuPart}`,
            price: basePrice,
            stock: 0,
            isActive: true,
            attributes: c.attrs.map(curr => ({
                attributeId: curr.attributeId,
                valueId: curr.valueId
            }))
        }));

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
        if (!productId) return; // Should not happen in create mode (button hidden)
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}/variants`, {
                method: 'POST',
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


    const updateVariant = (index: number, field: keyof Variant, value: unknown) => {
        const updated = [...variants];
        (updated[index] as any)[field] = value;
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'products/variants');

        try {
            // Set a temporary loading state for this variant if needed
            const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form });
            if (res.ok) {
                const data = await res.json();
                // Store as JSON string since schema expects String
                // But let's check if we want array or single. Schema says String?, likely for one JSON array or one URL.
                // ProductForm uses array of strings. Let's align.
                // Since schema is Text, we can store JSON string of array.
                // But for now, let's just assume we want to append to an array if it exists.

                const currentImages = parseImages(variants[index].images);
                const newImages = [...currentImages, data.path];
                updateVariant(index, 'images', JSON.stringify(newImages));
            }
        } catch {
            alert('Upload failed');
        }
    };

    const parseImages = (imagesStr?: string | null): string[] => {
        if (!imagesStr) return [];
        try {
            const parsed = JSON.parse(imagesStr);
            return Array.isArray(parsed) ? parsed : [imagesStr];
        } catch {
            return [imagesStr];
        }
    };

    const removeImage = (variantIndex: number, imgIndex: number) => {
        const currentImages = parseImages(variants[variantIndex].images);
        currentImages.splice(imgIndex, 1);
        updateVariant(variantIndex, 'images', JSON.stringify(currentImages));
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
                        {productId && (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Variant Name</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3 w-32">Price (€)</th>
                                    <th className="px-4 py-3 w-32">Stock</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3 w-24">Active</th>
                                    <th className="px-4 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {variants.map((variant, index) => {
                                    const variantImages = parseImages(variant.images);
                                    return (
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
                                                    className="w-full bg-transparent border border-gray-200 rounded px-3 py-2 focus:border-blue-500"
                                                    value={isNaN(variant.price) ? '' : variant.price}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value);
                                                        updateVariant(index, 'price', isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 focus:border-blue-500"
                                                    value={isNaN(variant.stock) ? '' : variant.stock}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value);
                                                        updateVariant(index, 'stock', isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    {variantImages.length > 0 ? (
                                                        <div className="relative w-8 h-8 rounded border overflow-hidden group">
                                                            <Image src={variantImages[0]} alt="Variant" fill className="object-cover" />
                                                            <button
                                                                onClick={() => removeImage(index, 0)}
                                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="w-8 h-8 flex items-center justify-center border border-dashed rounded cursor-pointer hover:bg-gray-100">
                                                            <Plus size={14} className="text-gray-400" />
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                                                        </label>
                                                    )}
                                                </div>
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
