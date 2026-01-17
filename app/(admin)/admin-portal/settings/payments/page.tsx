
"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Save, Loader2, ShieldCheck, Zap, Coins, Key } from 'lucide-react';

interface PaymentMethod {
    id: string;
    name: string;
    provider: 'stripe' | 'paypal' | 'manual';
    isEnabled: boolean;
    description: string;
    instructions?: string; // For manual/COD
    config?: {
        publicKey?: string;
        secretKey?: string;
        webhookSecret?: string;
        mode: 'test' | 'live';
    };
}

export default function PaymentsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config?includeSecrets=true');
            const configs = await res.json();

            let parsedMethods: PaymentMethod[] = [];
            if (configs.payment_methods) {
                parsedMethods = JSON.parse(configs.payment_methods);
            } else {
                parsedMethods = [
                    { id: '1', name: 'Credit Card (Stripe)', provider: 'stripe', isEnabled: true, description: 'Accept Visa, Mastercard, and Amex via Stripe.', config: { mode: 'test', publicKey: '', secretKey: '', webhookSecret: '' } },
                    { id: '2', name: 'PayPal', provider: 'paypal', isEnabled: false, description: 'Enable your customers to pay with their PayPal account.', config: { mode: 'test', publicKey: '', secretKey: '' } },
                    { id: '3', name: 'Cash on Delivery', provider: 'manual', isEnabled: true, description: 'Pay in cash when the order is delivered.', instructions: 'Please ensure you have the exact amount ready at delivery.' }
                ];
            }

            // Synchronize with individual keys in case they were updated separately
            const updatedMethods = parsedMethods.map(m => {
                if (m.provider === 'stripe') {
                    return {
                        ...m,
                        config: {
                            ...m.config,
                            publicKey: configs.stripe_publishable_key || m.config?.publicKey || '',
                            secretKey: configs.stripe_secret_key || m.config?.secretKey || '',
                            webhookSecret: configs.stripe_webhook_secret || m.config?.webhookSecret || '',
                            mode: (configs.stripe_mode as any) || m.config?.mode || 'test'
                        }
                    };
                }
                if (m.provider === 'paypal') {
                    return {
                        ...m,
                        config: {
                            ...m.config,
                            publicKey: configs.paypal_client_id || m.config?.publicKey || '',
                            secretKey: configs.paypal_secret_key || m.config?.secretKey || '',
                            mode: (configs.paypal_mode as any) || m.config?.mode || 'test'
                        }
                    };
                }
                return m;
            });

            setMethods(updatedMethods);
        } catch (error) {
            console.error('Failed to load payment config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Also sync individual config keys for the getSecretConfig utility
            const stripe = methods.find(m => m.provider === 'stripe')?.config;
            const paypal = methods.find(m => m.provider === 'paypal')?.config;

            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        payment_methods: JSON.stringify(methods),
                        // Synchronize individual keys for server-side utilities
                        stripe_publishable_key: stripe?.publicKey || '',
                        stripe_secret_key: stripe?.secretKey || '',
                        stripe_webhook_secret: stripe?.webhookSecret || '',
                        paypal_client_id: paypal?.publicKey || '',
                        paypal_secret_key: paypal?.secretKey || ''
                    }
                })
            });
            if (res.ok) alert('Payment configuration saved!');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleMethod = (id: string) => {
        setMethods(methods.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
    };

    const updateConfig = (id: string, field: string, value: any) => {
        setMethods(methods.map(m => {
            if (m.id === id) {
                if (field === 'instructions') return { ...m, instructions: value };
                const currentConfig = m.config || { mode: 'test' };
                return {
                    ...m,
                    config: {
                        ...currentConfig,
                        [field]: value
                    } as any
                };
            }
            return m;
        }));
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Payment Methods
                    </h1>
                    <p className="text-gray-500 text-sm">Activate and configure your payment gateways.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-md hover:bg-[#5a4635] disabled:opacity-50 transition-colors font-medium shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Payment Config
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {methods.map((method) => (
                    <div key={method.id} className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6 transition-all hover:border-[var(--coffee-brown)]/30">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${method.isEnabled ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-zinc-800'}`}>
                                    {method.provider === 'stripe' && <Zap className={`w-6 h-6 ${method.isEnabled ? 'text-indigo-500' : 'text-gray-400'}`} />}
                                    {method.provider === 'paypal' && <Coins className={`w-6 h-6 ${method.isEnabled ? 'text-blue-500' : 'text-gray-400'}`} />}
                                    {method.provider === 'manual' && <CreditCard className={`w-6 h-6 ${method.isEnabled ? 'text-green-500' : 'text-gray-400'}`} />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold flex items-center gap-2">{method.name}</h3>
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleMethod(method.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${method.isEnabled
                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                    }`}
                            >
                                {method.isEnabled ? 'Active' : 'Disabled'}
                            </button>
                        </div>

                        {method.isEnabled && (
                            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in slide-in-from-top-2 duration-300">
                                {method.provider !== 'manual' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                <Key className="w-3 h-3" /> {method.provider === 'paypal' ? 'Client ID' : 'Public API Key'}
                                            </label>
                                            <input
                                                type="text"
                                                value={method.config?.publicKey || ''}
                                                onChange={(e) => updateConfig(method.id, 'publicKey', e.target.value)}
                                                placeholder={`Enter your ${method.provider} ${method.provider === 'paypal' ? 'client id' : 'public key'}`}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border rounded-md text-sm font-mono focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Secret Key
                                            </label>
                                            <input
                                                type="password"
                                                value={method.config?.secretKey || ''}
                                                onChange={(e) => updateConfig(method.id, 'secretKey', e.target.value)}
                                                placeholder="••••••••••••••••"
                                                className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border rounded-md text-sm font-mono focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none"
                                            />
                                        </div>
                                        {method.provider === 'stripe' && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Webhook Secret
                                                </label>
                                                <input
                                                    type="password"
                                                    value={method.config?.webhookSecret || ''}
                                                    onChange={(e) => updateConfig(method.id, 'webhookSecret', e.target.value)}
                                                    placeholder="whsec_..."
                                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border rounded-md text-sm font-mono focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Environment Mode
                                            </label>
                                            <select
                                                value={method.config?.mode}
                                                onChange={(e) => updateConfig(method.id, 'mode', e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border rounded-md text-sm focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="test">Sandbox / Testing</option>
                                                <option value="live">Production / Live</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Instructions (Shown to Customer)</label>
                                        <textarea
                                            rows={3}
                                            value={method.instructions}
                                            onChange={(e) => updateConfig(method.id, 'instructions', e.target.value)}
                                            className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border rounded-md text-sm focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none"
                                            placeholder="Example: Please pay the courier in cash upon arrival."
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    All payment transactions are encrypted and processed through our PCI-DSS compliant providers.
                </p>
            </div>
        </div>
    );
}
