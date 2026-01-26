'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Store, Mail, Phone, Facebook, Instagram, Image as ImageIcon, CreditCard, ShieldCheck, Calendar, List, Truck, DollarSign } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import CarriersManager from '@/components/admin/CarriersManager';
import MenuEditor from '@/components/admin/MenuEditor';

interface ConfigMap {
    [key: string]: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<ConfigMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/config?includeSecrets=true');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Save error', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        const email = prompt("Enter email address to send test to:");
        if (!email) return;

        try {
            const res = await fetch('/api/admin/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email })
            });
            if (res.ok) {
                alert('Test email sent successfully!');
            } else {
                const data = await res.json();
                alert('Failed to send: ' + data.error);
            }
        } catch (error) {
            alert('Error sending test email');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'social', label: 'Social Media', icon: Facebook },
        { id: 'theme', label: 'Theme & Logo', icon: ImageIcon },
        { id: 'payment', label: 'Payments', icon: CreditCard },
        { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
        { id: 'taxes', label: 'Taxes & VAT', icon: DollarSign },
        { id: 'email', label: 'Email (SMTP)', icon: ShieldCheck },
        { id: 'seasonal', label: 'Seasonal / Ramadan', icon: Calendar },
        { id: 'menus', label: 'Menus & Navigation', icon: List },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-gray-500 text-sm">Manage global website configuration.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === tab.id
                                ? 'bg-[var(--coffee-brown)] text-white'
                                : 'bg-white dark:bg-zinc-900 text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Store Identity */}
                            <div className="border-b border-gray-100 dark:border-zinc-800 pb-6 mb-6">
                                <h3 className="text-lg font-medium mb-4">Store Identity</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                                        <input
                                            type="text"
                                            value={settings['store_name'] || settings['site_name'] || ''}
                                            onChange={(e) => {
                                                handleChange('store_name', e.target.value);
                                                handleChange('site_name', e.target.value);
                                            }}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official VAT / Tax Number</label>
                                        <input
                                            type="text"
                                            value={settings['vat_number'] || ''}
                                            onChange={(e) => handleChange('vat_number', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            placeholder="FR12345678901"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Email (Public)</label>
                                            <input
                                                type="email"
                                                value={settings['store_email'] || ''}
                                                onChange={(e) => handleChange('store_email', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Phone (Public)</label>
                                            <input
                                                type="text"
                                                value={settings['store_phone'] || ''}
                                                onChange={(e) => handleChange('store_phone', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Address (Invoices)</label>
                                        <textarea
                                            rows={3}
                                            value={settings['store_address'] || ''}
                                            onChange={(e) => handleChange('store_address', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            placeholder="123 Avenue..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEO & Meta */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">SEO & Metadata</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Homepage Meta Description</label>
                                        <textarea
                                            rows={2}
                                            value={settings['site_description'] || ''}
                                            onChange={(e) => handleChange('site_description', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Note:</strong> Advanced Shipping Rates (Colissimo/Mondial Relay tables) are managed via the Database Seed for now to ensure free calculation.
                                    Use this section for global shipping settings.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Free Shipping Threshold (€)</label>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    <input
                                        type="number"
                                        value={settings['free_shipping_threshold'] || '100'}
                                        onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Orders above this amount will technically be eligible for free shipping if the carrier supports it.</p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                                <h3 className="font-medium mb-4">Carrier Management</h3>
                                <CarriersManager />
                            </div>
                        </div>
                    )}

                    {activeTab === 'taxes' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Tax Configuration</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[var(--coffee-brown)]">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                                        </div>
                                        <span className="text-sm font-medium">Enable Tax Calculation (Global)</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Prefix</label>
                                        <input
                                            type="text"
                                            value={settings['invoice_prefix'] || 'INV-2025-'}
                                            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)] font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard VAT Rate (%)</label>
                                        <div className="relative max-w-xs">
                                            <input
                                                type="number"
                                                value={settings['tax_rate_standard'] || '20'}
                                                onChange={(e) => handleChange('tax_rate_standard', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reduced VAT Rate (%)</label>
                                        <div className="relative max-w-xs">
                                            <input
                                                type="number"
                                                value={settings['tax_rate_reduced'] || '5.5'}
                                                onChange={(e) => handleChange('tax_rate_reduced', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Applies to food items like Honey (Miel).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={settings['support_email'] || ''}
                                        onChange={(e) => handleChange('support_email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['support_phone'] || ''}
                                        onChange={(e) => handleChange('support_phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_facebook'] || ''}
                                        onChange={(e) => handleChange('social_facebook', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_instagram'] || ''}
                                        onChange={(e) => handleChange('social_instagram', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
                                <div className="flex items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <ImageUploader
                                            value={settings['logo_url'] || ''}
                                            onChange={(url) => handleChange('logo_url', url)}
                                            folder="branding"
                                        />
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Upload your store logo. Recommended size: 200x200px or larger. PNG or SVG preferred within transparency.
                                            </p>
                                            <input
                                                type="text"
                                                value={settings['logo_url'] || ''}
                                                onChange={(e) => handleChange('logo_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm font-mono text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings['primary_color'] || '#cfb160'}
                                        onChange={(e) => handleChange('primary_color', e.target.value)}
                                        className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings['primary_color'] || '#cfb160'}
                                        onChange={(e) => handleChange('primary_color', e.target.value)}
                                        className="w-32 px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Stripe Configuration</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publishable Key</label>
                                    <input
                                        type="text"
                                        value={settings['stripe_publishable_key'] || ''}
                                        onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="pk_test_..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Key</label>
                                    <input
                                        type="password"
                                        value={settings['stripe_secret_key'] || ''}
                                        onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="sk_test_..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook Secret</label>
                                    <input
                                        type="password"
                                        value={settings['stripe_webhook_secret'] || ''}
                                        onChange={(e) => handleChange('stripe_webhook_secret', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="whsec_..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">PayPal Configuration</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        value={settings['paypal_client_id'] || ''}
                                        onChange={(e) => handleChange('paypal_client_id', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Secret</label>
                                    <input
                                        type="password"
                                        value={settings['paypal_secret_key'] || ''}
                                        onChange={(e) => handleChange('paypal_secret_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Manual Payment Methods</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enable Cash on Delivery (COD)</label>
                                        <p className="text-xs text-gray-500">Allow customers to pay with cash upon arrival.</p>
                                    </div>
                                    <button
                                        onClick={() => handleChange('payment_cod_enabled', settings['payment_cod_enabled'] === 'true' ? 'false' : 'true')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings['payment_cod_enabled'] === 'true' ? 'bg-[var(--coffee-brown)]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings['payment_cod_enabled'] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-lg font-medium">SMTP Email Configuration</h3>
                                <button
                                    onClick={handleSendTestEmail}
                                    className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Send Test Email
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={settings['smtp_host'] || ''}
                                        onChange={(e) => handleChange('smtp_host', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Port</label>
                                    <input
                                        type="number"
                                        value={settings['smtp_port'] || '587'}
                                        onChange={(e) => handleChange('smtp_port', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Username</label>
                                    <input
                                        type="text"
                                        value={settings['smtp_user'] || ''}
                                        onChange={(e) => handleChange('smtp_user', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Password</label>
                                    <input
                                        type="password"
                                        value={settings['smtp_password'] || ''}
                                        onChange={(e) => handleChange('smtp_password', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Email</label>
                                    <input
                                        type="email"
                                        value={settings['smtp_from_email'] || ''}
                                        onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="no-reply@yemenimarket.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Name</label>
                                    <input
                                        type="text"
                                        value={settings['smtp_from_name'] || ''}
                                        onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="YEM KAF"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-4">
                                <h4 className="text-blue-800 font-medium text-sm mb-1">Configuration Tip</h4>
                                <p className="text-blue-600 text-xs">
                                    For Gmail, generate an &quot;App Password&quot; to use here. For other providers (Outlook, Hostinger, cPanel), use your standard SMTP credentials.
                                    Port 587 is usually for STARTTLS, 465 for SSL.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seasonal' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-lg font-medium">Ramadan Special Section</h3>
                                    <p className="text-sm text-gray-500">Enable and configure the Ramadan offers section on the homepage.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Section</span>
                                    <button
                                        onClick={() => handleChange('ramadan_mode_enabled', settings['ramadan_mode_enabled'] === 'true' ? 'false' : 'true')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings['ramadan_mode_enabled'] === 'true' ? 'bg-[var(--coffee-brown)]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings['ramadan_mode_enabled'] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={settings['ramadan_title'] || ''}
                                        onChange={(e) => handleChange('ramadan_title', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Ramadan Kareem Specials"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={settings['ramadan_subtitle'] || ''}
                                        onChange={(e) => handleChange('ramadan_subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Discover our curated selection..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product IDs (JSON Array)</label>
                                    <input
                                        type="text"
                                        value={settings['ramadan_product_ids'] || '[]'}
                                        onChange={(e) => handleChange('ramadan_product_ids', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="[1, 2, 3]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter product IDs as a JSON array, e.g. <span className="font-mono">[12, 15, 22]</span>.
                                        You can find IDs in the Products list.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'menus' && (
                        <div className="space-y-6 animate-in fade-in duration-300">

                            {/* Main Menu */}
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium">Main Navigation</h3>
                                    <p className="text-sm text-gray-500">Links shown in the top header.</p>
                                </div>
                                <MenuEditor
                                    value={settings['menu_main'] || '[]'}
                                    onChange={(json) => handleChange('menu_main', json)}
                                />
                            </div>

                            <hr className="border-gray-100 dark:border-zinc-800" />

                            {/* Footer Menu */}
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium">Footer &quot;Quick Links&quot;</h3>
                                    <p className="text-sm text-gray-500">Links shown in the footer column.</p>
                                </div>
                                <MenuEditor
                                    value={settings['menu_footer_links'] || '[]'}
                                    onChange={(json) => handleChange('menu_footer_links', json)}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Media Picker Modal would go here */}
        </div >
    );
}
