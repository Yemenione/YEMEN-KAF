'use client';

import React, { useEffect, useState } from 'react';

interface Rate {
    id: number;
    minWeight: number;
    maxWeight: number;
    price: number;
    carrier: { name: string; code: string };
    zone: { name: string };
}

export default function ShippingAdminPage() {
    const [rates, setRates] = useState<Rate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        fetchRates();
    }, []);

    async function fetchRates() {
        try {
            const res = await fetch('/api/admin/rates');
            const data = await res.json();
            if (data.success) {
                setRates(data.rates);
            }
        } catch (e) {
            alert('Failed to load rates');
        } finally {
            setLoading(false);
        }
    }

    async function updatePrice(id: number, newPrice: string) {
        setSaving(id);
        try {
            const res = await fetch('/api/admin/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, price: newPrice })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                setRates(rates.map(r => r.id === id ? { ...r, price: Number(newPrice) } : r));
            } else {
                alert('Error saving');
            }
        } catch (e) {
            alert('Error calling API');
        } finally {
            setSaving(null);
        }
    }

    if (loading) return <div className="p-10 text-center">Loading Backup Tool...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="bg-blue-600 p-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        📦 Shipping Rates Manager (Backup Tool)
                    </h1>
                    <p className="text-blue-100 mt-1">
                        Directly edit database shipping rates to sync with App & Site instantly.
                    </p>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                                    <th className="p-4 border-b">Carrier</th>
                                    <th className="p-4 border-b">Max Weight (g)</th>
                                    <th className="p-4 border-b">Current Price (€)</th>
                                    <th className="p-4 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rates.map((rate) => (
                                    <tr key={rate.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {rate.carrier.name}
                                            <span className="ml-2 text-xs text-gray-500">({rate.zone.name})</span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {rate.maxWeight >= 1000
                                                ? `${rate.maxWeight / 1000} kg`
                                                : `${rate.maxWeight} g`}
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={rate.price}
                                                onBlur={(e) => {
                                                    if (Number(e.target.value) !== rate.price) {
                                                        updatePrice(rate.id, e.target.value);
                                                    }
                                                }}
                                                className="w-24 p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                            <span className="ml-2">€</span>
                                        </td>
                                        <td className="p-4">
                                            {saving === rate.id && (
                                                <span className="text-sm text-blue-600 animate-pulse font-medium">
                                                    Saving...
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
