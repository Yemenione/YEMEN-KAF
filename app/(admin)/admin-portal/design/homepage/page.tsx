"use client";

import { useState, useEffect } from 'react';
import { Home, Save, Loader2, X, LayoutTemplate, Zap, Star } from 'lucide-react';

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
    const [flashSaleProductIds, setFlashSaleProductIds] = useState<number[]>([]);
    const [bestSellersIds, setBestSellersIds] = useState<number[]>([]);
    const [specialOffersIds, setSpecialOffersIds] = useState<number[]>([]);

    // Flash Sale Settings
    const [flashSaleEndDate, setFlashSaleEndDate] = useState("");
    const [flashSaleText, setFlashSaleText] = useState("");

    // Promo Grid Settings (3 tiles)
    const [promoGrid, setPromoGrid] = useState([
        { title: "", sub: "", image: "", link: "" },
        { title: "", sub: "", image: "", link: "" },
        { title: "", sub: "", image: "", link: "" }
    ]);

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

            if (configs.homepage_hero_products) setHeroProductIds(JSON.parse(configs.homepage_hero_products));
            if (configs.homepage_featured_categories) setFeaturedCategoryIds(JSON.parse(configs.homepage_featured_categories));
            if (configs.homepage_flash_sale_product_ids) setFlashSaleProductIds(JSON.parse(configs.homepage_flash_sale_product_ids));
            if (configs.homepage_best_sellers_ids) setBestSellersIds(JSON.parse(configs.homepage_best_sellers_ids));
            if (configs.homepage_special_offers_ids) setSpecialOffersIds(JSON.parse(configs.homepage_special_offers_ids));

            if (configs.homepage_flash_sale_end_date) setFlashSaleEndDate(configs.homepage_flash_sale_end_date);
            if (configs.homepage_flash_sale_ends_soon_text) setFlashSaleText(configs.homepage_flash_sale_ends_soon_text);
            if (configs.homepage_promo_grid) setPromoGrid(JSON.parse(configs.homepage_promo_grid));

            // 2. Fetch Products & Categories
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/products?limit=200'),
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
                        homepage_featured_categories: JSON.stringify(featuredCategoryIds),
                        homepage_flash_sale_product_ids: JSON.stringify(flashSaleProductIds),
                        homepage_flash_sale_end_date: flashSaleEndDate,
                        homepage_flash_sale_ends_soon_text: flashSaleText,
                        homepage_promo_grid: JSON.stringify(promoGrid),
                        homepage_best_sellers_ids: JSON.stringify(bestSellersIds),
                        homepage_special_offers_ids: JSON.stringify(specialOffersIds),
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

    const addItem = (id: number, list: number[], setter: (val: number[]) => void) => {
        if (!list.includes(id)) {
            setter([...list, id]);
        }
    };

    const removeItem = (id: number, list: number[], setter: (val: number[]) => void) => {
        setter(list.filter(i => i !== id));
    };

    const updatePromo = (idx: number, field: string, value: string) => {
        const newGrid = [...promoGrid];
        newGrid[idx] = { ...newGrid[idx], [field]: value };
        setPromoGrid(newGrid);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-6xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md py-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Home className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Homepage Content Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Design your discovery experience and conversion modules.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--coffee-brown)] text-white font-bold rounded-lg hover:bg-[#5a4635] disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Hero Slider */}
                <Section
                    title="Hero Slider Products"
                    icon={<LayoutTemplate className="w-5 h-5 text-amber-500" />}
                >
                    <ListManager
                        items={heroProductIds}
                        all={allProducts}
                        onAdd={(id) => addItem(id, heroProductIds, setHeroProductIds)}
                        onRemove={(id) => removeItem(id, heroProductIds, setHeroProductIds)}
                        placeholder="Select hero product..."
                    />
                </Section>

                {/* 2. Featured Collections */}
                <Section
                    title="Featured Collections"
                    icon={<LayoutTemplate className="w-5 h-5 text-blue-500" />}
                >
                    <ListManager
                        items={featuredCategoryIds}
                        all={allCategories}
                        onAdd={(id) => addItem(id, featuredCategoryIds, setFeaturedCategoryIds)}
                        onRemove={(id) => removeItem(id, featuredCategoryIds, setFeaturedCategoryIds)}
                        placeholder="Select collection..."
                        isCategory
                    />
                </Section>

                {/* 3. Flash Sale */}
                <Section
                    title="Flash Sale Module"
                    icon={<Zap className="w-5 h-5 text-red-500" />}
                >
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">End Date/Time</label>
                            <input
                                type="datetime-local"
                                value={flashSaleEndDate}
                                onChange={(e) => setFlashSaleEndDate(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">Urgency Text</label>
                            <input
                                type="text"
                                value={flashSaleText}
                                onChange={(e) => setFlashSaleText(e.target.value)}
                                placeholder="Ends soon!"
                                className="w-full mt-1 p-2 border rounded-md text-sm"
                            />
                        </div>
                    </div>
                    <ListManager
                        items={flashSaleProductIds}
                        all={allProducts}
                        onAdd={(id) => addItem(id, flashSaleProductIds, setFlashSaleProductIds)}
                        onRemove={(id) => removeItem(id, flashSaleProductIds, setFlashSaleProductIds)}
                        placeholder="Select flash sale product..."
                        max={4}
                    />
                </Section>

                {/* 4. Best Sellers & Special Offers (Combined for space) */}
                <div className="space-y-8">
                    <Section title="Best Sellers" icon={<Star className="w-5 h-5 text-yellow-500" />}>
                        <ListManager
                            items={bestSellersIds}
                            all={allProducts}
                            onAdd={(id) => addItem(id, bestSellersIds, setBestSellersIds)}
                            onRemove={(id) => removeItem(id, bestSellersIds, setBestSellersIds)}
                            placeholder="Select best seller..."
                            max={4}
                        />
                    </Section>
                    <Section title="Special Offers" icon={<LayoutTemplate className="w-5 h-5 text-green-500" />}>
                        <ListManager
                            items={specialOffersIds}
                            all={allProducts}
                            onAdd={(id) => addItem(id, specialOffersIds, setSpecialOffersIds)}
                            onRemove={(id) => removeItem(id, specialOffersIds, setSpecialOffersIds)}
                            placeholder="Select special offer..."
                            max={2}
                        />
                    </Section>
                </div>
            </div>

            {/* 5. Promo Grid (3 Dynamic Tiles) */}
            <div className="mt-8">
                <Section title="Promo Grid (Discovery Tiles)" icon={<LayoutTemplate className="w-5 h-5 text-purple-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {promoGrid.map((promo, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-3 border border-dashed border-gray-300">
                                <h4 className="font-bold text-xs uppercase text-gray-400">Tile {idx + 1}</h4>
                                <input placeholder="Title" value={promo.title} onChange={(e) => updatePromo(idx, 'title', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                <input placeholder="Subtitle" value={promo.sub} onChange={(e) => updatePromo(idx, 'sub', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                <input placeholder="Link (e.g. /shop?cat=1)" value={promo.link} onChange={(e) => updatePromo(idx, 'link', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                <input placeholder="Image URL" value={promo.image} onChange={(e) => updatePromo(idx, 'image', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                {promo.image && (
                                    <div className="h-20 w-full relative rounded-md overflow-hidden">
                                        <img src={promo.image} alt="Preview" className="object-cover h-full w-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-black/5 space-y-4">
            <h3 className="font-bold flex items-center gap-3 border-b pb-4 text-gray-800 dark:text-gray-100">
                {icon}
                {title}
            </h3>
            {children}
        </div>
    );
}

function ListManager({ items, all, onAdd, onRemove, placeholder, isCategory = false, max }: {
    items: number[];
    all: any[];
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
    placeholder: string;
    isCategory?: boolean;
    max?: number;
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-2 min-h-[50px]">
                {items.map(id => {
                    const item = all.find(i => i.id === id);
                    return (
                        <div key={id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span className="text-sm font-medium">{item?.name || `${isCategory ? 'Category' : 'Product'} #${id}`}</span>
                            <button onClick={() => onRemove(id)} className="p-1 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
                {items.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">Nothing selected.</p>}
            </div>

            {(max === undefined || items.length < max) && (
                <div className="pt-2">
                    <select
                        onChange={(e) => onAdd(Number(e.target.value))}
                        value=""
                        className="w-full p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:ring-2 ring-[var(--honey-gold)] outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                    >
                        <option value="" disabled>{placeholder}</option>
                        {all.filter(i => !items.includes(i.id)).map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
