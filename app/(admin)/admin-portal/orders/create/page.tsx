"use client";

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Plus, Minus, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateOrderPage() {
    const router = useRouter();

    // State
    const [step, setStep] = useState(1); // 1: Select Customer & Products, 2: Review & Pay
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);

    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchProduct, setSearchProduct] = useState('');

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch(`/api/products?limit=100&search=${searchProduct}`);
        const data = await res.json();
        setProducts(data.products || []);
    };

    const fetchCustomers = async () => {
        const res = await fetch(`/api/customers?search=${searchCustomer}`); // Assuming customers API supports search
        const data = await res.json();
        setCustomers(data || []); // Assuming direct array or {customers: []} - check API later but this is generic
    };

    // Handlers
    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQty = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    };

    const handleCreateOrder = async () => {
        if (!selectedCustomer || cart.length === 0) return;
        setCreating(true);

        try {
            const res = await fetch('/api/admin/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                    shippingAddress: {
                        firstName: selectedCustomer.first_name,
                        lastName: selectedCustomer.last_name,
                        address: 'In-Store Pickup', // Default for POS
                        city: 'Paris',
                        zip: '75000',
                        country: 'France',
                        email: selectedCustomer.email,
                        phone: selectedCustomer.phone
                    },
                    paymentMethod: 'cash_on_delivery', // Or add selector
                    status: 'completed' // Usually completed for POS
                })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/admin-portal/orders/${data.orderId}`);
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create order');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                            value={searchProduct}
                            onChange={(e) => {
                                setSearchProduct(e.target.value);
                                // Debounce or just trigger fetch on enter could be better, but simple for now
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-zinc-950">
                    {products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border shadow-sm flex flex-col hover:border-[var(--coffee-brown)] transition-colors cursor-pointer" onClick={() => addToCart(product)}>
                            <div className="aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden relative">
                                {product.images ? (
                                    <img src={JSON.parse(product.images)[0]} className="w-full h-full object-cover" />
                                ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                            </div>
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="font-bold text-[var(--coffee-brown)]">{parseFloat(product.price).toFixed(2)}€</span>
                                <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart & Customer */}
            <div className="w-96 flex flex-col bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
                {/* Customer Section */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                        <User className="w-4 h-4" /> Customer
                    </h3>
                    {selectedCustomer ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">{selectedCustomer.email}</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-blue-500 hover:text-blue-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customer..."
                                className="w-full px-3 py-2 border rounded-md text-sm dark:bg-zinc-800"
                                onChange={(e) => {
                                    setSearchCustomer(e.target.value);
                                    // In a real app, use a proper async select/dropdown
                                    // For now we'll just implement simple Enter-to-search or just type
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
                            />
                            {customers.length > 0 && searchCustomer && (
                                <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-800 border shadow-lg max-h-48 overflow-y-auto z-10 mt-1 rounded-md">
                                    {customers.map(c => (
                                        <div
                                            key={c.id}
                                            className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer text-sm"
                                            onClick={() => { setSelectedCustomer(c); setSearchCustomer(''); }}
                                        >
                                            {c.first_name} {c.last_name} ({c.email})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                            <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3 items-center group">
                                <div className="flex-1">
                                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-500">{parseFloat(item.price).toFixed(2)}€</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded px-2 py-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="hover:text-[var(--coffee-brown)]"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="hover:text-[var(--coffee-brown)]"><Plus className="w-3 h-3" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{(parseFloat(item.price) * item.quantity).toFixed(2)}€</p>

                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary & Pay */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal</span>
                        <span>{calculateTotal().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total</span>
                        <span>{calculateTotal().toFixed(2)}€</span>
                    </div>

                    <button
                        onClick={handleCreateOrder}
                        disabled={creating || !selectedCustomer || cart.length === 0}
                        className="w-full bg-[var(--coffee-brown)] text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-[#5a4635] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {creating ? 'Processing...' : <><CheckCircle className="w-5 h-5" /> Create Order</>}
                    </button>
                    {!selectedCustomer && (
                        <p className="text-xs text-red-500 text-center mt-2">Please select a customer</p>
                    )}
                </div>
            </div>
        </div>
    );
}
