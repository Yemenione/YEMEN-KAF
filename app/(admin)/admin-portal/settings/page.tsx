'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Mail, Phone, Facebook, Instagram, Image as ImageIcon, CreditCard, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface ConfigMap {
    [key: string]: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<ConfigMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config?includeSecrets=true');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'social', label: 'Social Media', icon: Facebook },
        { id: 'theme', label: 'Theme & Logo', icon: ImageIcon },
        { id: 'payment', label: 'Payments', icon: CreditCard },
        { id: 'email', label: 'Email (Resend)', icon: ShieldCheck },
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
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                                <input
                                    type="text"
                                    value={settings['site_name'] || ''}
                                    onChange={(e) => handleChange('site_name', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Description (SEO)</label>
                                <textarea
                                    rows={3}
                                    value={settings['site_description'] || ''}
                                    onChange={(e) => handleChange('site_description', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                />
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
                                    <div className="w-32 h-32 relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                        {settings['logo_url'] ? (
                                            <Image
                                                src={settings['logo_url']}
                                                alt="Site Logo"
                                                fill
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={settings['logo_url'] || ''}
                                            onChange={(e) => handleChange('logo_url', e.target.value)}
                                            placeholder="/images/logo.png"
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Enter path or allow selection in future updates.
                                        </p>
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
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium border-b pb-2">Email Service (Resend)</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resend API Key</label>
                                <input
                                    type="password"
                                    value={settings['resend_api_key'] || ''}
                                    onChange={(e) => handleChange('resend_api_key', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="re_..."
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Media Picker Modal would go here */}
        </div>
    );
}
