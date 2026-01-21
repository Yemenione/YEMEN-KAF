"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Package, Loader2, MoreVertical, Filter, Download } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { canAccessModule, hasPermission, Permission, AdminRole } from "@/lib/rbac";
import { toast } from "sonner";

interface Product {
    id: number;
    name: string;
    price: number;
    category_name: string;
    stock_quantity: number;
    is_active: boolean;
    images: string | string[]; // Can be JSON string or array of URLs
}

export default function AdminProductsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canManage = hasPermission(role, Permission.MANAGE_PRODUCTS);

    useEffect(() => {
        fetchProducts();
    }, [page, searchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
                sort: 'newest'
            });
            if (searchTerm) query.append('search', searchTerm);

            const res = await fetch(`/api/products?${query.toString()}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch {
            console.error("Failed to fetch products");
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        if (!canManage) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (res.ok) {
                toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Error updating status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!canManage) return;
        if (!confirm(t('admin.products.confirmDelete'))) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Product deleted successfully");
                setProducts(products.filter(p => p.id !== id));
            } else {
                toast.error("Failed to delete product");
            }
        } catch {
            toast.error("Error deleting product");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-[var(--coffee-brown)]" />
                        {t('admin.products.title')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage storefront inventory, pricing, and availability status.</p>
                </div>

                {canManage && (
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm">
                            <Download size={18} /> Export
                        </button>
                        <Link
                            href="/admin-portal/products/new"
                            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-zinc-500/10 transition-all text-sm font-bold"
                        >
                            <Plus size={18} /> {t('admin.products.addNew')}
                        </Link>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                {/* Search and Filters Bar */}
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.products.searchPlaceholder')}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--coffee-brown)]" />
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{t('admin.common.loading')}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <Package className="w-12 h-12 text-gray-100 mx-auto" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('admin.common.noResults')}</h3>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-zinc-800/30 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    <th className="px-6 py-4">{t('admin.products.name')}</th>
                                    <th className="px-5 py-4">{t('admin.products.category')}</th>
                                    <th className="px-5 py-4">{t('admin.products.price')}</th>
                                    <th className="px-5 py-4">{t('admin.products.stock')}</th>
                                    <th className="px-5 py-4 text-center">{t('admin.common.status')}</th>
                                    <th className="px-6 py-4 text-right">{t('admin.common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 relative rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex-shrink-0 overflow-hidden shadow-sm">
                                                    <Image
                                                        src={(() => {
                                                            try {
                                                                if (!product.images) return '/placeholder.svg';
                                                                if (Array.isArray(product.images)) return product.images[0] || '/placeholder.svg';
                                                                if (typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http'))) return product.images;
                                                                const parsed = JSON.parse(product.images);
                                                                return Array.isArray(parsed) ? parsed[0] : parsed || '/placeholder.svg';
                                                            } catch { return '/placeholder.svg'; }
                                                        })()}
                                                        alt={product.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-[var(--coffee-brown)] transition-colors tracking-tight">{product.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em] mt-0.5">REF: #{product.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider border border-zinc-200/50">
                                                {product.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm font-black text-gray-900 dark:text-white">
                                            <span className="text-[10px] opacity-40 mr-1 font-normal">€</span>
                                            {Number(product.price).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="h-1 w-16 bg-gray-50 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-gray-100/50">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${product.stock_quantity > 10 ? 'bg-emerald-500' : product.stock_quantity > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${Math.min(100, (product.stock_quantity / 50) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${product.stock_quantity > 10 ? 'text-emerald-600' : product.stock_quantity > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                                                    {product.stock_quantity === 0 ? 'Sold Out' : `${product.stock_quantity} Units`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => toggleStatus(product.id, product.is_active)}
                                                disabled={!canManage}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] transition-all border
                                                    ${product.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'} 
                                                    ${!canManage ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <span className={`w-1 h-1 rounded-full ${product.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                                                {product.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                                            </button>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {canManage ? (
                                                    <>
                                                        <Link
                                                            href={`/admin-portal/products/${product.id}`}
                                                            className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-[var(--coffee-brown)] hover:text-white shadow-sm transition-all group/btn"
                                                        >
                                                            <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-rose-600 hover:text-white shadow-sm transition-all group/btn"
                                                        >
                                                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={`/admin-portal/products/${product.id}`}
                                                        className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-zinc-900 hover:text-white shadow-sm transition-all group/btn"
                                                    >
                                                        <Search size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Section */}
                <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                        {t('admin.common.showing')} {products.length} {t('admin.common.results')}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 disabled:opacity-30 hover:shadow-md transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">
                            {page + 1}
                        </div>
                        <button
                            disabled={products.length < limit}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 disabled:opacity-30 hover:shadow-md transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
