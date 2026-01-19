
"use client";

import { useState, useEffect } from 'react';
import { Home, Save, Loader2, X, LayoutTemplate } from 'lucide-react';

interface Product {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

export default function HomepageManager() {
    const [heroProductIds, setHeroProductIds] = useState<number[]>([]);
    const [featuredCategoryIds, setFeaturedCategoryIds] = useState<number[]>([]);

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Config
            const configRes = await fetch('/api/admin/config');
            const configs = await configRes.json();

            if (configs.homepage_hero_products) {
                setHeroProductIds(JSON.parse(configs.homepage_hero_products));
            }
            if (configs.homepage_featured_categories) {
                setFeaturedCategoryIds(JSON.parse(configs.homepage_featured_categories));
            }

            // 2. Fetch Products & Categories for selectors
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/products?limit=100'),
                fetch('/api/admin/categories')
            ]);

            const prodData = await prodRes.json();
            const catData = await catRes.json();

            setAllProducts(prodData.products || []);
            setAllCategories(catData || []);
        } catch (error) {
            console.error('Failed to load homepage config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        homepage_hero_products: JSON.stringify(heroProductIds),
                        homepage_featured_categories: JSON.stringify(featuredCategoryIds)
                    }
                })
            });

            if (res.ok) {
                alert('Homepage configuration saved!');
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const addItem = (id: number, type: 'product' | 'category') => {
        if (type === 'product') {
            if (!heroProductIds.includes(id)) {
                setHeroProductIds([...heroProductIds, id]);
            }
        } else {
            if (!featuredCategoryIds.includes(id)) {
                setFeaturedCategoryIds([...featuredCategoryIds, id]);
            }
        }
    };

    const removeItem = (id: number, type: 'product' | 'category') => {
        if (type === 'product') {
            setHeroProductIds(heroProductIds.filter(i => i !== id));
        } else {
            setFeaturedCategoryIds(featuredCategoryIds.filter(i => i !== id));
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Home className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Homepage Content Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Design your landing page by selecting featured products and collections.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-md hover:bg-[#5a4635] disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Slider Products */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2 border-b pb-4">
                        <LayoutTemplate className="w-5 h-5 text-[var(--honey-gold)]" />
                        Hero Slider Products
                    </h3>
                    <div className="space-y-2">
                        {heroProductIds.map(id => {
                            const product = allProducts.find(p => p.id === id);
                            return (
                                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-md">
                                    <span className="text-sm font-medium">{product?.name || `Product #${id}`}</span>
                                    <button onClick={() => removeItem(id, 'product')} className="text-red-500 hover:text-red-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {heroProductIds.length === 0 && <p className="text-sm text-gray-400 italic">No products selected for the slider.</p>}
                    </div>
                    <div className="pt-4">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Add Product</label>
                        <select
                            onChange={(e) => addItem(Number(e.target.value), 'product')}
                            value=""
                            className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                        >
                            <option value="" disabled>Select a product...</option>
                            {allProducts.filter(p => !heroProductIds.includes(p.id)).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Featured Categories */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2 border-b pb-4">
                        <LayoutTemplate className="w-5 h-5 text-[var(--honey-gold)]" />
                        Featured Collections
                    </h3>
                    <div className="space-y-2">
                        {featuredCategoryIds.map(id => {
                            const category = allCategories.find(c => c.id === id);
                            return (
                                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-md">
                                    <span className="text-sm font-medium">{category?.name || `Category #${id}`}</span>
                                    <button onClick={() => removeItem(id, 'category')} className="text-red-500 hover:text-red-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {featuredCategoryIds.length === 0 && <p className="text-sm text-gray-400 italic">No collections selected for the homepage.</p>}
                    </div>
                    <div className="pt-4">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Add Collection</label>
                        <select
                            onChange={(e) => addItem(Number(e.target.value), 'category')}
                            value=""
                            className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                        >
                            <option value="" disabled>Select a collection...</option>
                            {allCategories.filter(c => !featuredCategoryIds.includes(c.id)).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> The Hero Slider looks best with 3-4 products. Featured Collections will appear as circular or grid links below the hero section.
                </p>
            </div>
        </div>
    );
}
