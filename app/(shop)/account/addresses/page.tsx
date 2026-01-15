"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Address {
    id: number;
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    is_default: number;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Yemen",
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/account/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
            }
        } catch (err) {
            console.error('Failed to fetch addresses', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/account/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchAddresses();
                setShowForm(false);
                setFormData({ street: "", city: "", state: "", postalCode: "", country: "Yemen", isDefault: false });
            }
        } catch (err) {
            console.error('Failed to create address', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

        try {
            const res = await fetch(`/api/account/addresses/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAddresses();
            }
        } catch (err) {
            console.error('Failed to delete address', err);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center py-12"><div className="text-gray-500">جاري التحميل...</div></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-black mb-2">Addresses / العناوين</h1>
                    <p className="text-gray-500">Manage your shipping addresses / إدارة عناوين الشحن</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-black text-white uppercase tracking-widest text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Address
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-serif text-xl text-black mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Street Address</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">City</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">State/Province</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Postal Code</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.postalCode}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Country</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="px-6 py-2 bg-black text-white uppercase text-sm font-bold hover:bg-gray-800">
                            Save Address
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 uppercase text-sm font-bold hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">لا توجد عناوين محفوظة</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-6 relative">
                            {address.is_default === 1 && (
                                <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
                            )}
                            <div className="space-y-2 mb-4">
                                <p className="font-medium text-black">{address.street}</p>
                                <p className="text-gray-600">{address.city}{address.state && `, ${address.state}`}</p>
                                <p className="text-gray-600">{address.postal_code && `${address.postal_code}, `}{address.country}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(address.id)}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
