
'use client';

import { useState, useEffect } from 'react';
import { Package, History, Search, ArrowUp, ArrowDown, Hash, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { clsx } from "clsx";
import { useUI } from '@/context/UIContext';

interface StockMovement {
    quantity: number;
    reason: string;
    createdAt: string;
}

interface ProductInventory {
    id: number;
    name: string;
    sku: string;
    reference: string;
    stockQuantity: number;
    price: string;
    isActive: boolean;
    images: string; // JSON or comma-separated
    category: { name: string };
    stockMovements: StockMovement[];
}

export default function InventoryPage() {
    const { t, locale } = useLanguage();
    const [products, setProducts] = useState<ProductInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
    const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
    const [adjustReason, setAdjustReason] = useState('');
    const [adjustType, setAdjustType] = useState<'add' | 'remove' | 'set'>('add');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load inventory', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async () => {
        if (!selectedProduct) return;
        if (adjustQuantity === 0 && adjustType !== 'set') return;

        let finalQty = adjustQuantity;
        if (adjustType === 'remove') finalQty = -Math.abs(adjustQuantity);

        try {
            const res = await fetch('/api/admin/inventory/movement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: finalQty,
                    reason: adjustReason || 'Manual Adjustment',
                    type: adjustType
                })
            });

            if (res.ok) {
                toast.success(t('common.success'));
                fetchInventory();
                setSelectedProduct(null);
                setAdjustQuantity(0);
                setAdjustReason('');
            } else {
                toast.error(t('common.error'));
            }
        } catch (error) {
            console.error('Adjustment error', error);
            toast.error(t('common.error'));
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(filter.toLowerCase())) ||
        (p.reference && p.reference.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
                        <Package className="w-7 h-7 text-[var(--coffee-brown)]" />
                        {t('admin.inventory.title')}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        {t('admin.inventory.description')}
                    </p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" />
                    <input
                        type="text"
                        placeholder={t('admin.products.searchPlaceholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--coffee-brown)]/20 outline-none text-sm font-medium w-full md:w-72 shadow-sm"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: t('admin.inventory.stats.totalItems'), value: products.length, color: 'text-[var(--coffee-brown)]', icon: Hash },
                    { label: t('admin.inventory.stats.lowStock'), value: products.filter(p => p.stockQuantity < 5).length, color: 'text-rose-500', icon: ArrowDown },
                    {
                        label: t('admin.inventory.stats.totalValue'),
                        value: new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'fr-FR', { style: 'currency', currency: 'EUR' }).format(
                            products.reduce((acc, p) => acc + (p.stockQuantity * parseFloat(p.price)), 0)
                        ),
                        color: 'text-emerald-600',
                        icon: ArrowUp
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                        </div>
                        <stat.icon className={`w-8 h-8 opacity-10 ${stat.color}`} />
                    </div>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{t('admin.inventory.table.product')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{t('admin.inventory.table.sku')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">{t('admin.inventory.table.stock')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{t('admin.inventory.table.value')}</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">{t('admin.inventory.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">{t('admin.inventory.loading')}</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">{t('admin.inventory.noResults')}</td></tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-[var(--coffee-brown)] transition-colors">{product.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.category?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[11px] bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                                                {product.reference || product.sku || '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={clsx(
                                                "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black italic",
                                                product.stockQuantity < 5
                                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                                                    : product.stockQuantity < 20
                                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                            )}>
                                                {product.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                            {new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.price) * product.stockQuantity)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--coffee-brown)] hover:bg-[var(--coffee-brown)]/10 rounded-lg transition-all"
                                            >
                                                <History size={14} /> {t('admin.inventory.adjust.title')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjustment Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl max-w-sm w-full border border-gray-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight">{t('admin.inventory.adjust.title')}</h3>
                            <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('admin.inventory.table.product')}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedProduct.name}</p>
                            </div>

                            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-800">
                                {(['add', 'remove', 'set'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setAdjustType(type)}
                                        className={clsx(
                                            "flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
                                            adjustType === type
                                                ? 'bg-white dark:bg-zinc-700 shadow-sm text-[var(--coffee-brown)]'
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                        {adjustType === 'set' ? t('admin.inventory.adjust.quantity') : t('admin.inventory.adjust.quantity')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={adjustQuantity}
                                            onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--coffee-brown)]/20 outline-none text-sm font-bold shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('admin.inventory.adjust.reason')}</label>
                                    <input
                                        type="text"
                                        placeholder="Note..."
                                        value={adjustReason}
                                        onChange={(e) => setAdjustReason(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--coffee-brown)]/20 outline-none text-sm font-bold shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--honey-gold)]/5 rounded-2xl border border-[var(--honey-gold)]/10 space-y-1">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500 font-bold uppercase tracking-wider">{t('admin.inventory.adjust.current')}</span>
                                    <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedProduct.stockQuantity}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-900 dark:text-white font-black uppercase tracking-widest">{t('admin.inventory.adjust.after')}</span>
                                    <span className="font-mono font-black text-[var(--coffee-brown)]">
                                        {adjustType === 'set'
                                            ? adjustQuantity
                                            : adjustType === 'add'
                                                ? selectedProduct.stockQuantity + adjustQuantity
                                                : Math.max(0, selectedProduct.stockQuantity - adjustQuantity)
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-zinc-800/20 border-t border-gray-50 dark:border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-zinc-700 transition-all"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleStockAdjustment}
                                className="flex-1 py-3 text-sm font-black italic bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                            >
                                {t('admin.inventory.adjust.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
