
'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, History, AlertTriangle, CheckCircle, Search } from 'lucide-react';

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
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async () => {
        if (!selectedProduct || adjustQuantity === 0) return;

        // Calculate signed quantity based on type
        let finalQty = adjustQuantity;
        if (adjustType === 'remove') finalQty = -Math.abs(adjustQuantity);

        // If 'set', the backend logic handles the delta calculation, but our API 
        // as designed in previous step takes 'type' param to handle this.

        try {
            const res = await fetch('/api/admin/inventory/movement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: finalQty, // For 'set', this is the target value
                    reason: adjustReason || 'Manual Adjustment',
                    type: adjustType
                })
            });

            if (res.ok) {
                // Refresh data
                fetchInventory();
                setSelectedProduct(null);
                setAdjustQuantity(0);
                setAdjustReason('');
            } else {
                alert('Failed to update stock');
            }
        } catch (error) {
            console.error('Adjustment error', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(filter.toLowerCase())) ||
        (p.reference && p.reference.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Inventory Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Real-time stock tracking and adjustments.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search SKU or Name..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)] w-full md:w-64"
                    />
                </div>
            </div>

            {/* Stats Cards (Optional future expansion) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Items</p>
                    <p className="text-3xl font-bold text-[var(--coffee-brown)]">{products.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 uppercase font-bold">Low Stock Alerts</p>
                    <p className="text-3xl font-bold text-red-500">{products.filter(p => p.stockQuantity < 5).length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Stock Value</p>
                    <p className="text-3xl font-bold text-green-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                            products.reduce((acc, p) => acc + (p.stockQuantity * parseFloat(p.price)), 0)
                        )}
                    </p>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Product</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Ref / SKU</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-center">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Value (Est.)</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[var(--coffee-brown)]">{product.name}</div>
                                        <div className="text-xs text-gray-400">{product.category?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {product.reference || product.sku || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${product.stockQuantity < 5
                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                : product.stockQuantity < 20
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {product.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.price) * product.stockQuantity)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="text-sm font-medium text-[var(--coffee-brown)] hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <History className="w-3 h-3" /> Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Adjustment Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold">Adjust Stock: {selectedProduct.name}</h3>

                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-md">
                            {(['add', 'remove', 'set'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setAdjustType(type)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded capitalize transition-all ${adjustType === type
                                            ? 'bg-white shadow text-[var(--coffee-brown)]'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                {adjustType === 'set' ? 'New Total Quantity' : 'Quantity to Change'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={adjustQuantity}
                                onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Reason / Note</label>
                            <input
                                type="text"
                                placeholder="e.g., Restock, Damaged, Correction"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                            />
                        </div>

                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md border border-blue-100">
                            Current: <strong>{selectedProduct.stockQuantity}</strong>
                            <br />
                            After Adjustment: <strong>
                                {adjustType === 'set'
                                    ? adjustQuantity
                                    : adjustType === 'add'
                                        ? selectedProduct.stockQuantity + adjustQuantity
                                        : selectedProduct.stockQuantity - adjustQuantity
                                }
                            </strong>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStockAdjustment}
                                className="px-4 py-2 text-sm font-medium text-white bg-[var(--coffee-brown)] hover:bg-[#5a4635] rounded-md"
                            >
                                Save Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
