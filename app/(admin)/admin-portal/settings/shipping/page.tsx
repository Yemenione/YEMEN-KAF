
"use client";

import { useState, useEffect } from 'react';
import { Truck, Save, Loader2, Plus, X, Globe, DollarSign, Clock } from 'lucide-react';

interface Carrier {
    id: string;
    name: string;
    transitTime: string;
    baseCost: number;
    isActive: boolean;
}

export default function ShippingPage() {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCarriers();
    }, []);

    const fetchCarriers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config');
            const configs = await res.json();
            if (configs.shipping_carriers) {
                setCarriers(JSON.parse(configs.shipping_carriers));
            } else {
                setCarriers([
                    { id: '1', name: 'Standard Shipping', transitTime: '3-5 Business Days', baseCost: 5.90, isActive: true },
                    { id: '2', name: 'Express Delivery', transitTime: '1-2 Business Days', baseCost: 15.00, isActive: true }
                ]);
            }
        } catch (error) {
            console.error('Failed to load shipping config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        shipping_carriers: JSON.stringify(carriers)
                    }
                })
            });
            if (res.ok) alert('Shipping configuration saved!');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const addCarrier = () => {
        const newCarrier: Carrier = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Carrier',
            transitTime: '3-5 Days',
            baseCost: 0,
            isActive: true
        };
        setCarriers([...carriers, newCarrier]);
    };

    const removeCarrier = (id: string) => {
        setCarriers(carriers.filter(c => c.id !== id));
    };

    const updateCarrier = (id: string, field: keyof Carrier, value: any) => {
        setCarriers(carriers.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Truck className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Shipping & Carriers
                    </h1>
                    <p className="text-gray-500 text-sm">Configure shipping methods, zones, and delivery costs.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-md hover:bg-[#5a4635] disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Shipping Config
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {carriers.map((carrier) => (
                    <div key={carrier.id} className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-500" />
                                </div>
                                <input
                                    className="text-lg font-bold bg-transparent border-none focus:ring-0 w-64"
                                    value={carrier.name}
                                    onChange={(e) => updateCarrier(carrier.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={carrier.isActive}
                                        onChange={(e) => updateCarrier(carrier.id, 'isActive', e.target.checked)}
                                        className="rounded border-gray-300 text-[var(--coffee-brown)] focus:ring-[var(--coffee-brown)]"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                                <button onClick={() => removeCarrier(carrier.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Transit Time
                                </label>
                                <input
                                    className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                                    value={carrier.transitTime}
                                    onChange={(e) => updateCarrier(carrier.id, 'transitTime', e.target.value)}
                                    placeholder="e.g. 3-5 Business Days"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Base Shipping Cost (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                                    value={carrier.baseCost}
                                    onChange={(e) => updateCarrier(carrier.id, 'baseCost', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Target Zone
                                </label>
                                <select className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm">
                                    <option>International (All Countries)</option>
                                    <option>France (Metropolitan)</option>
                                    <option>European Union</option>
                                    <option>Middle East</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addCarrier}
                    className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--coffee-brown)] hover:border-[var(--coffee-brown)] hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all group"
                >
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-[var(--coffee-brown)] group-hover:text-white transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-xs">Add New Shipping Method</span>
                </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Shipping costs set here will be applied during checkout. You can also define "Free Shipping" triggers in the **Marketing** section using Cart Rules.
                </p>
            </div>
        </div>
    );
}
