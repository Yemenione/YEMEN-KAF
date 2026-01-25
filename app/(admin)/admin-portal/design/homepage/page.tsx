"use client";

import { useState, useEffect } from 'react';
import { Home, Save, Loader2, X, LayoutTemplate, Zap, Star, Upload, Search, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Product {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

export default function HomepageManager() {
    const { t } = useLanguage();
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
                alert(t('marketing.design.homepage.messages.saved'));
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'promos');

        // Optional: show some loading indicator for this specific tile
        const btn = e.target.closest('label');
        if (btn) btn.style.opacity = '0.5';

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.path) {
                updatePromo(idx, 'image', data.path);
            } else {
                alert(t('admin.design.homepage.messages.uploadFailed') + ': ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert(t('admin.design.homepage.messages.uploadFailed'));
        } finally {
            if (btn) btn.style.opacity = '1';
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-6xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md py-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Home className="w-8 h-8 text-[var(--coffee-brown)]" />
                        {t('admin.design.homepage.title')}
                    </h1>
                    <p className="text-gray-500 text-sm">{t('admin.design.homepage.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--coffee-brown)] text-white font-bold rounded-lg hover:bg-[#5a4635] disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? t('admin.design.homepage.saving') : t('admin.design.homepage.saveAll')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Hero Slider */}
                <Section
                    title={t('admin.design.homepage.sections.hero')}
                    icon={<LayoutTemplate className="w-5 h-5 text-amber-500" />}
                >
                    <ListManager
                        items={heroProductIds}
                        all={allProducts}
                        onAdd={(id) => addItem(id, heroProductIds, setHeroProductIds)}
                        onRemove={(id) => removeItem(id, heroProductIds, setHeroProductIds)}
                        placeholder={t('admin.design.homepage.list.selectHero')}
                    />
                </Section>

                {/* 2. Featured Collections */}
                <Section
                    title={t('admin.design.homepage.sections.featured')}
                    icon={<LayoutTemplate className="w-5 h-5 text-blue-500" />}
                >
                    <ListManager
                        items={featuredCategoryIds}
                        all={allCategories}
                        onAdd={(id) => addItem(id, featuredCategoryIds, setFeaturedCategoryIds)}
                        onRemove={(id) => removeItem(id, featuredCategoryIds, setFeaturedCategoryIds)}
                        placeholder={t('admin.design.homepage.list.selectCollection')}
                        isCategory
                    />
                </Section>

                {/* 3. Flash Sale */}
                <Section
                    title={t('admin.design.homepage.sections.flashSale')}
                    icon={<Zap className="w-5 h-5 text-red-500" />}
                >
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">{t('admin.design.homepage.form.endDate')}</label>
                            <input
                                type="datetime-local"
                                value={flashSaleEndDate}
                                onChange={(e) => setFlashSaleEndDate(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">{t('admin.design.homepage.form.urgencyText')}</label>
                            <input
                                type="text"
                                value={flashSaleText}
                                onChange={(e) => setFlashSaleText(e.target.value)}
                                placeholder={t('admin.design.homepage.form.urgencyPlaceholder')}
                                className="w-full mt-1 p-2 border rounded-md text-sm"
                            />
                        </div>
                    </div>
                    <ListManager
                        items={flashSaleProductIds}
                        all={allProducts}
                        onAdd={(id) => addItem(id, flashSaleProductIds, setFlashSaleProductIds)}
                        onRemove={(id) => removeItem(id, flashSaleProductIds, setFlashSaleProductIds)}
                        placeholder={t('admin.design.homepage.list.selectFlashSale')}
                        max={4}
                    />
                </Section>

                {/* 4. Best Sellers & Special Offers (Combined for space) */}
                <div className="space-y-8">
                    <Section title={t('admin.design.homepage.sections.bestSellers')} icon={<Star className="w-5 h-5 text-yellow-500" />}>
                        <ListManager
                            items={bestSellersIds}
                            all={allProducts}
                            onAdd={(id) => addItem(id, bestSellersIds, setBestSellersIds)}
                            onRemove={(id) => removeItem(id, bestSellersIds, setBestSellersIds)}
                            placeholder={t('admin.design.homepage.list.selectBestSeller')}
                            max={4}
                        />
                    </Section>
                    <Section title={t('admin.design.homepage.sections.specialOffers')} icon={<LayoutTemplate className="w-5 h-5 text-green-500" />}>
                        <ListManager
                            items={specialOffersIds}
                            all={allProducts}
                            onAdd={(id) => addItem(id, specialOffersIds, setSpecialOffersIds)}
                            onRemove={(id) => removeItem(id, specialOffersIds, setSpecialOffersIds)}
                            placeholder={t('admin.design.homepage.list.selectSpecialOffer')}
                            max={2}
                        />
                    </Section>
                </div>
            </div>

            {/* 5. Promo Grid (3 Dynamic Tiles) */}
            <div className="mt-8">
                <Section title={t('admin.design.homepage.sections.promoGrid')} icon={<LayoutTemplate className="w-5 h-5 text-purple-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {promoGrid.map((promo, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-3 border border-dashed border-gray-300">
                                <h4 className="font-bold text-xs uppercase text-gray-400">{t('admin.design.homepage.form.tile')} {idx + 1}</h4>
                                <input placeholder={t('admin.design.homepage.form.title')} value={promo.title} onChange={(e) => updatePromo(idx, 'title', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                <input placeholder={t('admin.design.homepage.form.subtitle')} value={promo.sub} onChange={(e) => updatePromo(idx, 'sub', e.target.value)} className="w-full p-2 text-sm border rounded-md" />
                                <input placeholder={t('admin.design.homepage.form.link')} value={promo.link} onChange={(e) => updatePromo(idx, 'link', e.target.value)} className="w-full p-2 text-sm border rounded-md" />

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t('admin.design.homepage.form.imageSource')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            placeholder={t('admin.design.homepage.form.imagePlaceholder')}
                                            value={promo.image}
                                            onChange={(e) => updatePromo(idx, 'image', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded-md"
                                        />
                                        <label className="cursor-pointer p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm" title={t('admin.design.homepage.form.upload')}>
                                            <Upload className="w-4 h-4 text-gray-600" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, idx)}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {promo.image && (
                                    <div className="h-20 w-full relative rounded-md overflow-hidden">
                                        <div className="relative w-full h-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={promo.image} alt="Preview" className="object-cover h-full w-full" />
                                        </div>
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all: { id: number; name: string;[key: string]: any }[];
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
    placeholder: string;
    isCategory?: boolean;
    max?: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { t } = useLanguage();
    const available = all.filter(i => !items.includes(i.id));
    const filtered = available.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            {/* Selected Items List */}
            <div className="space-y-2 min-h-[50px]">
                {items.map(id => {
                    const item = all.find(i => i.id === id);
                    return (
                        <div key={id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-700 rounded-xl hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {isCategory ? 'C' : 'P'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {item?.name || `${isCategory ? t('admin.design.homepage.list.category') : t('admin.design.homepage.list.product')} #${id}`}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemove(id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm text-gray-400 italic">{t('admin.design.homepage.list.noItems')}</p>
                    </div>
                )}
            </div>

            {/* Add New Item Dropdown */}
            {(max === undefined || items.length < max) && (
                <div className="relative">
                    {!isOpen ? (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-full p-3 text-left border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all flex justify-between items-center group"
                        >
                            <span className="text-gray-400 text-sm group-hover:text-gray-600">{placeholder}</span>
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>
                    ) : (
                        <div className="absolute top-0 left-0 w-full z-50 border rounded-xl p-3 bg-white dark:bg-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-700 pb-2 mb-2 px-1">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    autoFocus
                                    placeholder={available.length > 0 ? t('admin.design.homepage.list.search') : t('admin.design.homepage.list.noAvailable')}
                                    disabled={available.length === 0}
                                    className="flex-1 outline-none text-sm bg-transparent dark:text-white placeholder:text-gray-300"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <button onClick={() => { setIsOpen(false); setSearch(""); }} className="hover:bg-gray-100 rounded-full p-1"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar">
                                {filtered.length > 0 ? (
                                    filtered.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => { onAdd(item.id); setIsOpen(false); setSearch(""); }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-lg text-sm flex items-center justify-between group"
                                        >
                                            <span className="text-gray-700 dark:text-gray-200">{item.name}</span>
                                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400" />
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 p-2 text-center">
                                        {available.length === 0 ? t('admin.design.homepage.list.allSelected') : t('admin.design.homepage.list.noResults')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Backdrop to close when clicking outside */}
                    {isOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(""); }} />
                    )}
                </div>
            )}
        </div>
    );
}
