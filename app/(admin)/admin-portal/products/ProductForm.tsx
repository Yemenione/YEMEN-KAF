"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, Box, DollarSign, FileText, Layers, Truck, Globe, Trash2, Percent } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from 'clsx';
import ProductVariantsManager from "@/components/admin/products/ProductVariantsManager";
import { useLanguage } from "@/context/LanguageContext";

interface ProductFormProps {
    initialData?: Partial<Product>; // Use Partial<Product> or define a proper shape
    isEdit?: boolean;
}

// Need to define Product interface if not imported
interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price?: number | null;
    cost_price?: number;
    stock_quantity: number;
    images: string | string[]; // Can be JSON string or array of URLs
    category_id: number;
    brand_id: number;
    tax_rule_id: number;
    is_active: boolean | number;
    is_featured: boolean | number;
    meta_title?: string;
    meta_description?: string;
    related_ids?: string;
    hs_code?: string;
    origin_country?: string;
    weight?: number;
    width?: number;
    height?: number;
    depth?: number;
    carriers?: { id: number }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
    // Removed index signature to enforce stricter typing, add optional fields if needed
    [key: string]: unknown; // Safer than any if strictly necessary, or remove entirely if possible
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // Data Sources
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
    const [taxRules, setTaxRules] = useState<{ id: number; name: string; rate: number; country: string }[]>([]);
    // Use a more specific type than any[] for variants if possible, or unknown[] for now
    const [variants, setVariants] = useState<unknown[]>([]);
    const [carriers, setCarriers] = useState<{ id: number; name: string; logo: string | null }[]>([]);

    const [allProducts, setAllProducts] = useState<Product[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        description: "",
        price: 0,
        compare_at_price: 0,
        cost_price: 0,
        tax_rule_id: "",
        stock_quantity: 0,
        weight: 0,
        width: 0,
        height: 0,
        depth: 0,
        category_id: "",
        brand_id: "",
        images: [] as string[],
        image_url: "",
        is_active: true,
        is_featured: false,
        meta_title: "",
        meta_description: "",
        related_ids: "[]",
        hs_code: "",
        origin_country: "Yemen",
        carriers: [] as number[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        translations: {} as Record<string, any>
    });

    const [activeLang, setActiveLang] = useState('en');
    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'French', flag: '🇫🇷' },
        { code: 'ar', label: 'Arabic', flag: '🇾🇪' }
    ];

    // Fetch Categories, Brands, Tax Rules, Carriers
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, brandRes, taxRes, prodRes, carrRes] = await Promise.all([
                    fetch('/api/admin/categories'),
                    fetch('/api/admin/brands'),
                    fetch('/api/admin/tax-rules'),
                    fetch('/api/products'),
                    fetch('/api/admin/carriers')
                ]);

                if (catRes.ok) setCategories(await catRes.json());
                if (brandRes.ok) setBrands(await brandRes.json());
                if (taxRes.ok) setTaxRules(await taxRes.json());
                if (prodRes.ok) {
                    const data = await prodRes.json();
                    setAllProducts(data.products || []);
                }
                if (carrRes.ok) setCarriers(await carrRes.json());
            } catch {
                console.error("Failed to load form data");
            }
        };
        fetchData();
    }, []);

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            let images: string[] = [];
            try {
                if (initialData.images) {
                    if (Array.isArray(initialData.images)) {
                        images = initialData.images;
                    } else {
                        const parsed = JSON.parse(initialData.images as string);
                        images = Array.isArray(parsed) ? parsed : [initialData.images as string];
                    }
                }
            } catch {
                if (initialData.images && typeof initialData.images === 'string') {
                    images = [initialData.images];
                }
            }

            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                sku: initialData.sku ? String(initialData.sku) : "",
                description: initialData.description || "",
                price: Number(initialData.price ?? 0),
                compare_at_price: Number(initialData.compare_at_price ?? initialData.compareAtPrice ?? 0),
                cost_price: Number(initialData.cost_price ?? 0),
                tax_rule_id: initialData.tax_rule_id != null ? String(initialData.tax_rule_id) : (initialData.taxRuleId != null ? String(initialData.taxRuleId) : ""),
                stock_quantity: Number(initialData.stock_quantity ?? 0),
                weight: Number(initialData.weight ?? 0),
                width: Number(initialData.width ?? 0),
                height: Number(initialData.height ?? 0),
                depth: Number(initialData.depth ?? 0),
                category_id: initialData.category_id != null ? String(initialData.category_id) : (initialData.categoryId != null ? String(initialData.categoryId) : ""),
                brand_id: initialData.brand_id != null ? String(initialData.brand_id) : (initialData.brandId != null ? String(initialData.brandId) : ""),
                images: images,
                image_url: images[0] || "",
                is_active: initialData.isActive === true || initialData.is_active === 1 || initialData.is_active === true,
                is_featured: initialData.isFeatured === true || initialData.is_featured === 1 || initialData.is_featured === true,
                meta_title: initialData.meta_title || "",
                meta_description: initialData.meta_description || "",
                related_ids: initialData.related_ids || "[]",
                hs_code: initialData.hs_code || "",
                origin_country: initialData.origin_country || "Yemen",
                carriers: initialData.carriers ? initialData.carriers.map((c: { id: number }) => c.id) : [],
                translations: initialData.translations ? (typeof initialData.translations === 'string' ? JSON.parse(initialData.translations) : initialData.translations) : {}
            });
        }
    }, [initialData]);

    // ... (handlers)

    // Inside render, specifically the "logistics" tab


    const generateAutoSku = () => {
        const prefix = "YEM";
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        const time = Date.now().toString().slice(-4);
        setFormData(prev => ({ ...prev, sku: `${prefix}-${random}-${time}` }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImage(true);
        const files = Array.from(e.target.files);

        try {
            const uploadedUrls = await Promise.all(files.map(async (file) => {
                const form = new FormData();
                form.append('file', file);
                form.append('folder', 'products');
                const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form });
                if (res.ok) {
                    const data = await res.json();
                    return data.path;
                }
                return null;
            }));

            const validUrls = uploadedUrls.filter(url => url !== null) as string[];
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...validUrls],
                image_url: prev.image_url || validUrls[0] || "" // Set primary if empty
            }));
        } catch { alert('Upload failed'); }
        finally { setUploadingImage(false); }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return {
                ...prev,
                images: newImages,
                image_url: newImages[0] || ""
            };
        });
    };

    // Helper to get value based on active language
    const getValue = (field: string) => {
        if (activeLang === 'en') return formData[field as keyof typeof formData] as string;
        return formData.translations?.[activeLang]?.[field] || '';
    };

    // Helper to set value based on active language
    const setValue = (field: string, value: string) => {
        if (activeLang === 'en') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [activeLang]: {
                        ...prev.translations[activeLang],
                        [field]: value
                    }
                }
            }));
        }
    };

    const handleAutoTranslate = async () => {
        // Gather content from current active language
        const currentContent = {
            name: getValue('name'),
            description: getValue('description'),
            meta_title: getValue('meta_title'),
            meta_description: getValue('meta_description')
        };

        if (!currentContent.name) return alert(t('admin.products.form.fillNameFirst', { lang: activeLang.toUpperCase() }));

        setLoading(true);
        try {
            const { translateContent } = await import('@/app/actions/ai');

            // Target languages are all except current
            const targetLangs = languages.filter(l => l.code !== activeLang).map(l => l.code);

            const res = await translateContent(currentContent, targetLangs, activeLang);

            if (res.error) {
                alert(res.error);
            } else if (res.data) {
                setFormData(prev => {
                    const next = { ...prev };

                    // Distribute translations
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    Object.entries(res.data).forEach(([langCode, values]: [string, any]) => {
                        if (langCode === 'en') {
                            // Update main fields if English is one of the targets (i.e. source was not English)
                            next.name = values.name || next.name;
                            next.description = values.description || next.description;
                            next.meta_title = values.meta_title || next.meta_title;
                            next.meta_description = values.meta_description || next.meta_description;
                        } else {
                            // Update translation object
                            next.translations = {
                                ...next.translations,
                                [langCode]: {
                                    ...next.translations[langCode],
                                    ...values
                                }
                            };
                        }
                    });

                    return next;
                });
            }
        } catch (e) {
            console.error(e);
            alert(t('admin.categories.translationFailed') || "Translation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = (isEdit && initialData) ? `/api/products/${initialData.id}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
            tax_rule_id: formData.tax_rule_id ? parseInt(formData.tax_rule_id) : null,
            images: JSON.stringify(formData.images), // Save full array
            image_url: formData.images[0] || "", // Legacy support
            variants: !isEdit ? variants : undefined
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin-portal/products');
                router.refresh();
            } else {
                const err = await res.json();
                alert(`${t('admin.common.error')}: ${err.error || t('admin.settings.error')}`);
            }
        } catch {
            alert(t('admin.categories.operationFailed') || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: string; label: string; icon: React.ComponentType<{ size?: number }>; hidden?: boolean }[] = [
        { id: "general", label: t('admin.products.form.tabs.general'), icon: FileText },
        { id: "pricing", label: t('admin.products.form.tabs.pricing'), icon: DollarSign },
        { id: "logistics", label: t('admin.products.form.tabs.logistics'), icon: Truck },
        { id: "seo", label: t('admin.products.form.tabs.seo'), icon: Globe },
        { id: "associations", label: t('admin.products.form.tabs.associations'), icon: Layers },
        { id: "variants", label: t('admin.products.form.tabs.variants'), icon: Box },
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm sticky top-20 z-[30]">
                <div className="flex flex-col gap-1">
                    <Link href="/admin-portal/products" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[var(--coffee-brown)] dark:hover:text-[var(--honey-gold)] transition-colors uppercase tracking-widest">
                        <ArrowLeft size={14} /> {t('admin.products.form.backToCatalog')}
                    </Link>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        {isEdit ? t('admin.products.form.modifyProduct') : t('admin.products.form.createNewProduct')}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {t('admin.products.form.discard')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 bg-gradient-to-r from-[var(--coffee-brown)] to-zinc-800 dark:from-[var(--honey-gold)] dark:to-amber-500 text-white dark:text-black font-black text-sm rounded-xl hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? t('admin.products.form.processing') : <><Save size={18} /> {t('admin.products.form.saveChanges')}</>}
                    </button>
                </div>
            </div>

            {/* Main Form Layout */}
            <div className="grid grid-cols-12 gap-8">

                {/* Sidebar Navigation (Tabs) */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 p-2 sticky top-44 shadow-sm">
                        <nav className="flex flex-col gap-1">
                            {tabs.filter(t => !t.hidden).map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 relative group/tab",
                                        activeTab === tab.id
                                            ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/5"
                                            : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-900/50"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-1.5 rounded-lg transition-colors group-hover/tab:scale-110 duration-300",
                                        activeTab === tab.id ? "bg-[var(--coffee-brown)] text-white dark:bg-[var(--honey-gold)] dark:text-black" : "bg-gray-100 dark:bg-zinc-800 group-hover/tab:bg-gray-200 dark:group-hover/tab:bg-zinc-700"
                                    )}>
                                        <tab.icon size={16} />
                                    </div>
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--honey-gold)]" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-span-12 md:col-span-9 space-y-6">

                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold">{t('admin.products.form.basicInfo')}</h3>
                                <div className="flex items-center gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => setActiveLang(lang.code)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeLang === lang.code
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            <span className="text-base">{lang.flag}</span>
                                            {lang.label}
                                        </button>
                                    ))}
                                    {activeLang !== 'en' && (
                                        <button
                                            type="button"
                                            onClick={handleAutoTranslate}
                                            disabled={loading}
                                            className="ml-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-purple-200 transition-colors flex items-center gap-1"
                                        >
                                            ✨ {t('admin.products.form.aiTranslate')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.namePlaceholder', { lang: activeLang.toUpperCase() })}</label>
                                    <input
                                        required={activeLang === 'en'}
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={getValue('name')}
                                        onChange={e => setValue('name', e.target.value)}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('admin.products.form.sku')} *</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                className="w-full pr-24 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                                                value={formData.sku}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                placeholder="e.g. YEM-HONEY-01"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateAutoSku}
                                                className="absolute right-1 top-1 bottom-1 px-3 text-[10px] font-bold uppercase bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200"
                                            >
                                                {t('admin.common.generate') || 'Generate'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-lg border dark:border-zinc-700 w-full">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4 text-[var(--coffee-brown)] rounded focus:ring-[var(--honey-gold)]"
                                            />
                                            <span className="font-medium">{t('admin.products.form.activeVisible')}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-lg border dark:border-zinc-700 w-full">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured}
                                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-4 h-4 text-[var(--coffee-brown)] rounded focus:ring-[var(--honey-gold)]"
                                            />
                                            <span className="font-medium">{t('admin.products.form.featured')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.description')} ({activeLang.toUpperCase()})</label>
                                    <div className="relative">
                                        <textarea
                                            className="w-full px-3 py-2 border rounded-lg h-40 dark:bg-zinc-800 dark:border-zinc-700 pb-10"
                                            value={getValue('description')}
                                            onChange={e => setValue('description', e.target.value)}
                                            placeholder={t('admin.products.form.descAiPlaceholder', { lang: activeLang })}
                                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!formData.name) return alert("Please enter a product name first.");
                                                setLoading(true); // Re-use main loading or add locally? Ideally local.
                                                // Actually let's use a local loading state for AI to not block whole form
                                                try {
                                                    const { generateProductDescription } = await import('@/app/actions/ai');
                                                    // Use name + category name as keywords base
                                                    const categoryName = categories.find(c => String(c.id) === formData.category_id)?.name || "";
                                                    const res = await generateProductDescription(formData.name, categoryName, `${formData.name}, ${categoryName}, luxury, yemen`);

                                                    if (res.error) alert(res.error);
                                                    else if (res.description) {
                                                        setFormData(prev => ({ ...prev, description: res.description }));
                                                    }
                                                } catch {
                                                    alert("AI Generation failed");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading}
                                            className="absolute bottom-3 right-3 text-xs bg-[var(--honey-gold)] text-black px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:brightness-110 shadow-sm transition-all disabled:opacity-50"
                                        >
                                            {loading ? t('admin.products.form.thinking') : <>✨ {t('admin.products.form.generateWithAi')}</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Images Section (Main Images) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.images')}</label>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-4">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 dark:border-zinc-700">
                                                    <Image src={img} alt={`Product ${idx}`} fill className="object-cover" sizes="100px" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    {idx === 0 && (
                                                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                                                            {t('admin.products.form.main')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}

                                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                                {uploadingImage ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                                                ) : (
                                                    <>
                                                        <UploadCloud size={24} className="text-gray-400 mb-1" />
                                                        <span className="text-[10px] text-gray-500">{t('admin.products.form.upload')}</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    disabled={uploadingImage}
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {t('admin.products.form.imageDesc')}
                                            Suggested size: 1000x1000px.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === "pricing" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">{t('admin.products.form.pricingStrategy')}</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.retailPrice')} *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.price || ""}
                                            onChange={e => setFormData({ ...formData, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.compareAtPrice')}</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.compare_at_price || ""}
                                            onChange={e => setFormData({ ...formData, compare_at_price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.compareAtPriceDesc')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.costPrice')}</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.cost_price || ""}
                                            onChange={e => setFormData({ ...formData, cost_price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.costPriceDesc')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.taxRule')}</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 appearance-none bg-none"
                                            value={formData.tax_rule_id}
                                            onChange={e => setFormData({ ...formData, tax_rule_id: e.target.value })}
                                        >
                                            <option value="">{t('admin.products.form.noTax')}</option>
                                            {taxRules.map((rule) => (
                                                <option key={rule.id} value={rule.id}>
                                                    {rule.name} ({rule.rate}%) - {rule.country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>{t('admin.products.form.taxRuleNote')}</span>
                                        <Link href="/admin-portal/settings/taxes" className="text-blue-500 hover:underline">
                                            {t('admin.products.form.manageRules')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logistics Tab */}
                    {activeTab === "logistics" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">{t('admin.products.form.shippingLogistics')}</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.stockQty')}</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.stock_quantity || ""}
                                        onChange={e => setFormData({ ...formData, stock_quantity: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.weightKg')}</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.weight || ""}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">{t('admin.products.form.dimensionsCm')}</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">{t('admin.products.form.width')}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.width || ""}
                                            onChange={e => setFormData({ ...formData, width: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">{t('admin.products.form.height')}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.height || ""}
                                            onChange={e => setFormData({ ...formData, height: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">{t('admin.products.form.depth') || 'Depth'}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.depth || ""}
                                            onChange={e => setFormData({ ...formData, depth: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-zinc-800 space-y-6">
                                <h4 className="text-sm font-medium text-[var(--coffee-brown)] dark:text-[var(--honey-gold)] flex items-center gap-2">
                                    <Globe size={16} /> {t('admin.products.form.intlCustoms')}
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('admin.products.form.hsCode')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 0409.00.00 (Honey)"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.hs_code}
                                            onChange={e => setFormData({ ...formData, hs_code: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.hsCodeDesc')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('admin.products.form.countryOrigin')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.origin_country}
                                            onChange={e => setFormData({ ...formData, origin_country: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-zinc-800 space-y-6">
                                <h4 className="text-sm font-medium text-[var(--coffee-brown)] dark:text-[var(--honey-gold)] flex items-center gap-2">
                                    <Truck size={16} /> {t('admin.products.form.allowedCarriers')}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {carriers.map(carrier => (
                                        <label key={carrier.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.carriers.includes(carrier.id)
                                            ? "bg-[var(--coffee-brown)] text-white border-transparent"
                                            : "bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-gray-100"
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.carriers.includes(carrier.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, carriers: [...formData.carriers, carrier.id] });
                                                    } else {
                                                        setFormData({ ...formData, carriers: formData.carriers.filter(id => id !== carrier.id) });
                                                    }
                                                }}
                                            />
                                            {carrier.logo && (
                                                <div className="w-8 h-8 relative bg-white rounded-md overflow-hidden flex-shrink-0">
                                                    <Image src={carrier.logo} alt={carrier.name} fill sizes="32px" className="object-contain p-1" />
                                                </div>
                                            )}
                                            <span className="font-medium text-sm">{carrier.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">{t('admin.products.form.carrierDesc')}</p>
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === "seo" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold">{t('admin.products.form.searchEngineOpt')}</h3>
                                <div className="flex items-center gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => setActiveLang(lang.code)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeLang === lang.code
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            {lang.flag} {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('admin.products.form.metaTitle')} ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                    value={getValue('meta_title')}
                                    placeholder={getValue('name')}
                                    onChange={e => setValue('meta_title', e.target.value)}
                                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.metaTitleDesc')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('admin.products.form.metaDescription')} ({activeLang.toUpperCase()})</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg h-24 dark:bg-zinc-800 dark:border-zinc-700"
                                    value={getValue('meta_description')}
                                    onChange={e => setValue('meta_description', e.target.value)}
                                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('admin.products.form.metaDescDesc')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('admin.products.form.friendlyUrl')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-500"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder={t('admin.products.form.slugPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Associations Tab */}
                    {activeTab === "associations" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">{t('admin.products.form.associations')}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.category')}</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">{t('admin.products.form.selectCategory')}</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.products.form.brand') || 'Brand'}</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.brand_id}
                                        onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                                    >
                                        <option value="">{t('admin.products.form.selectBrand')}</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-zinc-800">
                                <label className="block text-sm font-medium mb-3">{t('admin.products.form.relatedProducts')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {allProducts.filter(p => p.id !== initialData?.id).map((prod) => {
                                        const relatedIds = JSON.parse(formData.related_ids || "[]");
                                        const isSelected = relatedIds.includes(prod.id);
                                        return (
                                            <button
                                                key={prod.id}
                                                type="button"
                                                onClick={() => {
                                                    const newIds = isSelected
                                                        ? relatedIds.filter((id: number) => id !== prod.id)
                                                        : [...relatedIds, prod.id];
                                                    setFormData({ ...formData, related_ids: JSON.stringify(newIds) });
                                                }}
                                                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${isSelected
                                                    ? "bg-[var(--coffee-brown)] text-white border-transparent"
                                                    : "bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:border-zinc-700"
                                                    }`}
                                            >
                                                {prod.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variants Tab */}
                    {activeTab === "variants" && (
                        <div className="animate-fade-in">
                            <ProductVariantsManager
                                productId={isEdit ? initialData?.id : undefined}
                                basePrice={formData.price}
                                baseSku={formData.sku}
                                onChange={!isEdit ? setVariants : undefined}
                            />
                        </div>
                    )}

                </div>

                {/* Wizard Navigation Footer for Tabs */}
                {activeTab !== "variants" && (
                    <div className="flex justify-end pt-4 border-t dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => {
                                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                if (currentIndex < tabs.length - 1) {
                                    setActiveTab(tabs[currentIndex + 1].id);
                                }
                            }}
                            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {t('admin.products.form.nextStep')} &rarr;
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}
