"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Search, Save } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Permission, AdminRole } from "@/lib/rbac";
import { toast } from "sonner";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    isActive: boolean;
    _count?: { products: number };
}

export default function BrandsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        logo: "",
        description: "",
        isActive: true
    });

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canManage = hasPermission(role, Permission.MANAGE_BRANDS);

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/brands');
            if (res.ok) setBrands(await res.json());
        } catch {
            toast.error("Failed to load brands");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || "",
            description: brand.description || "",
            isActive: brand.isActive
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingBrand(null);
        setFormData({ name: "", slug: "", logo: "", description: "", isActive: true });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
        const method = editingBrand ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(editingBrand ? "Brand updated" : "Brand created");
                setIsModalOpen(false);
                fetchBrands();
            } else {
                toast.error("Failed to save brand");
            }
        } catch {
            toast.error("Network error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.brands.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Brand deleted");
                fetchBrands();
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Save className="w-6 h-6 text-[var(--coffee-brown)]" />
                        {t('admin.brands.title')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage manufacturers and brand partnerships.</p>
                </div>

                {canManage && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-zinc-500/10 transition-all text-sm font-bold"
                    >
                        <Plus size={18} /> {t('admin.brands.addNew')}
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.brands.searchPlaceholder')}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">{t('admin.brands.logo')}</th>
                                <th className="px-6 py-4">{t('admin.products.name')}</th>
                                <th className="px-6 py-4">{t('admin.products.form.slug')}</th>
                                <th className="px-6 py-4">{t('admin.sidebar.items.products')}</th>
                                <th className="px-6 py-4">{t('admin.common.status')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.loading')}</td></tr>
                            ) : filteredBrands.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.noResults')}</td></tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-6 py-3">
                                            <div className="relative w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-700 shadow-sm">
                                                {brand.logo ? (
                                                    <Image src={brand.logo} alt={brand.name} fill sizes="40px" className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{brand.name}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-500 font-mono">{brand.slug}</td>
                                        <td className="px-6 py-3">
                                            <span className="text-sm font-bold text-gray-500">{brand._count?.products || 0}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${brand.isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                                                }`}>
                                                {brand.isActive ? t('admin.common.active') : t('admin.common.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(brand)}
                                                    className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-[var(--coffee-brown)] hover:text-white shadow-sm transition-all group/btn"
                                                >
                                                    <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand.id)}
                                                    className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-rose-600 hover:text-white shadow-sm transition-all group/btn"
                                                >
                                                    <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-4">
                    {loading ? (
                        <div className="text-center py-8 text-sm text-gray-400">{t('admin.common.loading')}</div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400">{t('admin.common.noResults')}</div>
                    ) : (
                        filteredBrands.map((brand) => (
                            <div key={brand.id} className="bg-gray-50/50 dark:bg-zinc-800/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm p-2">
                                    {brand.logo ? (
                                        <Image src={brand.logo} alt={brand.name} fill sizes="56px" className="object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{brand.name}</h3>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${brand.isActive
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                            {brand.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono truncate mb-1.5">{brand.slug}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400">{brand._count?.products || 0} Products</span>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-blue-600 shadow-sm"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-rose-600 shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="text-lg font-bold text-[var(--coffee-brown)] dark:text-white">{editingBrand ? 'Edit Brand' : 'New Brand'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.name')}</label>
                                <input
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.form.slug')}</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="auto-generated"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.brands.logo')} URL</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                    value={formData.logo}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${formData.isActive
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                    {formData.isActive ? t('admin.common.active') : t('admin.common.inactive')}
                                </button>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:shadow-lg transition-all text-sm font-black"
                                >
                                    Save Brand
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
