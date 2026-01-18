"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, Box, DollarSign, FileText, Layers, Truck, Tag, Globe, Settings, Trash2, Percent } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductVariantsManager from "@/components/admin/products/ProductVariantsManager";

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // Data Sources
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [taxRules, setTaxRules] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [carriers, setCarriers] = useState<any[]>([]);

    const [allProducts, setAllProducts] = useState<any[]>([]);

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
        carriers: [] as number[]
    });

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
            } catch (error) {
                console.error("Failed to load form data", error);
            }
        };
        fetchData();
    }, []);

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            let images: string[] = [];
            try {
                const parsed = JSON.parse(initialData.images);
                images = Array.isArray(parsed) ? parsed : [initialData.images];
            } catch {
                if (initialData.images) images = [initialData.images];
            }

            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                sku: initialData.sku || "",
                description: initialData.description || "",
                price: parseFloat(initialData.price) || 0,
                compare_at_price: parseFloat(initialData.compareAtPrice) || 0,
                cost_price: parseFloat(initialData.cost_price) || 0,
                tax_rule_id: initialData.taxRuleId?.toString() || "",
                stock_quantity: initialData.stock_quantity || 0,
                weight: parseFloat(initialData.weight) || 0,
                width: parseFloat(initialData.width) || 0,
                height: parseFloat(initialData.height) || 0,
                depth: parseFloat(initialData.depth) || 0,
                category_id: (initialData.category_id || initialData.categoryId)?.toString() || "",
                brand_id: (initialData.brand_id || initialData.brandId)?.toString() || "",
                images: images,
                image_url: images[0] || "",
                is_active: initialData.isActive ?? (initialData.is_active === 1 || initialData.is_active === true),
                is_featured: initialData.isFeatured ?? (initialData.is_featured === 1 || initialData.is_featured === true),
                meta_title: initialData.meta_title || "",
                meta_description: initialData.meta_description || "",
                related_ids: initialData.related_ids || "[]",
                hs_code: initialData.hs_code || "",
                origin_country: initialData.origin_country || "Yemen",
                carriers: initialData.carriers ? initialData.carriers.map((c: any) => c.id) : []
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
        } catch (err) { alert('Upload failed'); }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
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
                alert(`Error: ${err.error || 'Failed to save product'}`);
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "general", label: "General", icon: FileText },
        { id: "pricing", label: "Pricing", icon: DollarSign },
        { id: "logistics", label: "Shipping", icon: Truck },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "associations", label: "Connections", icon: Layers },
        { id: "variants", label: "Variants", icon: Box },
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/admin-portal/products" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft size={18} /> Back to Inventory
                </Link>
                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 dark:border-zinc-700">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[var(--coffee-brown)] dark:bg-[var(--honey-gold)] text-white dark:text-black font-medium text-sm rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Product</>}
                    </button>
                </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Sidebar Navigation (Tabs) */}
                <div className="col-span-12 md:col-span-3">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden sticky top-6">
                        <nav className="flex flex-col">
                            {(tabs as any[]).filter(t => !t.hidden).map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-[var(--coffee-brown)] text-white dark:bg-[var(--honey-gold)] dark:text-black"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
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
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">Basic Information</h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">SKU / Reference *</label>
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
                                                Generate
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
                                            <span className="font-medium">Active (Visible)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-lg border dark:border-zinc-700 w-full">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured}
                                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-4 h-4 text-[var(--coffee-brown)] rounded focus:ring-[var(--honey-gold)]"
                                            />
                                            <span className="font-medium">Featured</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <div className="relative">
                                        <textarea
                                            className="w-full px-3 py-2 border rounded-lg h-40 dark:bg-zinc-800 dark:border-zinc-700 pb-10"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter product description..."
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
                                                    const categoryName = categories.find(c => c.id == formData.category_id)?.name || "";
                                                    const res = await generateProductDescription(formData.name, categoryName, `${formData.name}, ${categoryName}, luxury, yemen`);

                                                    if (res.error) alert(res.error);
                                                    else if (res.description) {
                                                        setFormData(prev => ({ ...prev, description: res.description }));
                                                    }
                                                } catch (e) {
                                                    alert("AI Generation failed");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading}
                                            className="absolute bottom-3 right-3 text-xs bg-[var(--honey-gold)] text-black px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:brightness-110 shadow-sm transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Thinking...' : <>✨ Generate with AI</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Images Section (Main Images) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Images</label>
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
                                                            Main
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
                                                        <span className="text-[10px] text-gray-500">Upload</span>
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
                                            First image will be the main cover. Drag to reorder (coming soon).
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
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">Pricing Strategy</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Retail Price (Tax Incl.) *</label>
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
                                    <label className="block text-sm font-medium mb-1">Compare at Price (Original Price)</label>
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
                                    <p className="text-xs text-gray-500 mt-1">If set, the main price will appear as a sale price.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cost Price (Excl. Tax)</label>
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
                                    <p className="text-xs text-gray-500 mt-1">For internal margin calculations.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tax Rule</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 appearance-none bg-none"
                                            value={formData.tax_rule_id}
                                            onChange={e => setFormData({ ...formData, tax_rule_id: e.target.value })}
                                        >
                                            <option value="">No Tax (0%)</option>
                                            {taxRules.map((rule: any) => (
                                                <option key={rule.id} value={rule.id}>
                                                    {rule.name} ({rule.rate}%) - {rule.country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>Applied to sales price.</span>
                                        <Link href="/admin-portal/settings/taxes" className="text-blue-500 hover:underline">
                                            Manage Rules
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logistics Tab */}
                    {activeTab === "logistics" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">Shipping & Logistics</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.stock_quantity || ""}
                                        onChange={e => setFormData({ ...formData, stock_quantity: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
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
                                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Dimensions (cm)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Width</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.width || ""}
                                            onChange={e => setFormData({ ...formData, width: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Height</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.height || ""}
                                            onChange={e => setFormData({ ...formData, height: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Depth</label>
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
                                    <Globe size={16} /> International & Customs (Colissimo Required)
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">HS Code (Customs Tariff)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 0409.00.00 (Honey)"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.hs_code}
                                            onChange={e => setFormData({ ...formData, hs_code: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Required for international Colissimo labels.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Country of Origin</label>
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
                                    <Truck size={16} /> Allowed Carriers
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
                                <p className="text-xs text-gray-500">Select which carriers can ship this product. If none selected, all active carriers will be available.</p>
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === "seo" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">Search Engine Optimization</h3>

                            <div>
                                <label className="block text-sm font-medium mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.meta_title}
                                    placeholder={formData.name}
                                    onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Ideally 50-60 characters.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Meta Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg h-24 dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.meta_description}
                                    onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1"> Ideally 150-160 characters.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Friendly URL (Slug)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-500"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="auto-generated-from-name"
                                />
                            </div>
                        </div>
                    )}

                    {/* Associations Tab */}
                    {activeTab === "associations" && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                            <h3 className="text-lg font-semibold border-b pb-4 dark:border-zinc-800">Associations</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Brand</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.brand_id}
                                        onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brand: any) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-zinc-800">
                                <label className="block text-sm font-medium mb-3">Related Products / Accessories</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {allProducts.filter(p => p.id !== initialData?.id).map((prod: any) => {
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
                            Next Step &rarr;
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}
