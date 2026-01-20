"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

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
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, searchTerm]);

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.products.confirmDelete'))) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch {
            alert("Error deleting product");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold">{t('admin.products.title')}</h2>
                <Link
                    href="/admin-portal/products/new"
                    className="flex items-center gap-2 bg-[var(--coffee-brown)] dark:bg-[var(--honey-gold)] text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} /> {t('admin.products.addNew')}
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--honey-gold)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading inventory...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No products found.</div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg p-4 shadow-sm flex gap-4">
                                <div className="w-20 h-20 relative rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {product.images ? (
                                        <Image
                                            src={(() => {
                                                try {
                                                    if (!product.images) return '/placeholder.png';
                                                    if (Array.isArray(product.images)) {
                                                        return product.images.length > 0 ? product.images[0] : '/placeholder.png';
                                                    }
                                                    if (typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http'))) {
                                                        return product.images;
                                                    }
                                                    const parsed = JSON.parse(product.images as string);
                                                    const url = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                                                    if (url && typeof url === 'string' && (url.startsWith('/') || url.startsWith('http'))) return url;
                                                } catch { }
                                                return typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http')) ? product.images : '/placeholder.png';
                                            })()}
                                            alt={product.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    ) : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate pr-2">{product.name}</h3>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{product.category_name || '-'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">€{Number(product.price).toFixed(2)}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${product.stock_quantity > 5 ? 'bg-green-50 text-green-700' : product.stock_quantity > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <Link href={`/admin-portal/products/${product.id}`} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 uppercase tracking-wider font-medium">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="w-10 h-10 relative rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                                {product.images ? (
                                                    <Image
                                                        src={(() => {
                                                            try {
                                                                if (!product.images) return '/placeholder.png';
                                                                if (Array.isArray(product.images)) {
                                                                    return product.images.length > 0 ? product.images[0] : '/placeholder.png';
                                                                }
                                                                if (typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http'))) {
                                                                    return product.images;
                                                                }
                                                                const parsed = JSON.parse(product.images as string);
                                                                const url = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                                                                if (url && typeof url === 'string' && (url.startsWith('/') || url.startsWith('http'))) return url;
                                                            } catch { }
                                                            return typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http')) ? product.images : '/placeholder.png';
                                                        })()}
                                                        alt={product.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                    />
                                                ) : <div className="w-full h-full bg-gray-200" />}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.category_name || '-'}</td>
                                        <td className="px-6 py-4 font-medium">{Number(product.price).toFixed(2)}€</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity > 5 ? 'bg-green-100 text-green-700' : product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock_quantity} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`w-2 h-2 rounded-full inline-block mr-2 ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            {product.is_active ? 'Active' : 'Draft'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link href={`/admin-portal/products/${product.id}`} className="text-blue-600 hover:text-blue-800 p-1 inline-block">
                                                <Edit size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1 inline-block">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="text-sm text-gray-500">Page {page + 1}</span>
                    <button
                        disabled={products.length < limit}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
