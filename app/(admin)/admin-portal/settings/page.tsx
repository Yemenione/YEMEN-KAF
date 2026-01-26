'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Store, Mail, Phone, Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle, Music, Ghost, Image as ImageIcon, CreditCard, ShieldCheck, Calendar, List, Truck, DollarSign } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import CarriersManager from '@/components/admin/CarriersManager';
import MenuEditor from '@/components/admin/MenuEditor';
import { useLanguage } from '@/context/LanguageContext';

interface ConfigMap {
    [key: string]: string;
}

export default function SettingsPage() {
    const { t } = useLanguage();
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
                alert(t('admin.settings.success'));
            } else {
                alert(t('admin.settings.error'));
            }
        } catch (error) {
            console.error('Save error', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        const email = prompt(t('admin.settings.email.testPrompt'));
        if (!email) return;

        try {
            const res = await fetch('/api/admin/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email })
            });
            if (res.ok) {
                alert(t('admin.settings.email.testSuccess'));
            } else {
                const data = await res.json();
                alert(t('admin.settings.email.testError') + data.error);
            }
        } catch (error) {
            alert(t('admin.settings.email.testError'));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('admin.common.loading')}</div>;

    const tabs = [
        { id: 'general', label: t('admin.settings.tabs.general'), icon: Store },
        { id: 'contact', label: t('admin.settings.tabs.contact'), icon: Mail },
        { id: 'social', label: t('admin.settings.tabs.social'), icon: Facebook },
        { id: 'theme', label: t('admin.settings.tabs.theme'), icon: ImageIcon },
        { id: 'payment', label: t('admin.settings.tabs.payment'), icon: CreditCard },
        { id: 'shipping', label: t('admin.settings.tabs.shipping'), icon: Truck },
        { id: 'taxes', label: t('admin.settings.tabs.taxes'), icon: DollarSign },
        { id: 'email', label: t('admin.settings.tabs.email'), icon: ShieldCheck },
        { id: 'seasonal', label: t('admin.settings.tabs.seasonal'), icon: Calendar },
        { id: 'menus', label: t('admin.settings.tabs.menus'), icon: List },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.settings.title')}</h1>
                    <p className="text-gray-500 text-sm">{t('admin.settings.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? t('admin.settings.saving') : <><Save className="w-4 h-4" /> {t('admin.settings.saveChanges')}</>}
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
                                <h3 className="text-lg font-medium mb-4">{t('admin.settings.general.identity')}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.name')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.vat')}</label>
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.email')}</label>
                                            <input
                                                type="email"
                                                value={settings['store_email'] || ''}
                                                onChange={(e) => handleChange('store_email', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.phone')}</label>
                                            <input
                                                type="text"
                                                value={settings['store_phone'] || ''}
                                                onChange={(e) => handleChange('store_phone', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.address')}</label>
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
                                <h3 className="text-lg font-medium mb-4">{t('admin.settings.general.seo')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.general.metaDescription')}</label>
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
                                    {t('admin.settings.shipping.note')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.shipping.threshold')}</label>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    <input
                                        type="number"
                                        value={settings['free_shipping_threshold'] || '100'}
                                        onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('admin.settings.shipping.thresholdDesc')}</p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                                <h3 className="font-medium mb-4">{t('admin.settings.shipping.carrierMgmt')}</h3>
                                <CarriersManager />
                            </div>
                        </div>
                    )}

                    {activeTab === 'taxes' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-medium mb-4">{t('admin.settings.taxes.title')}</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[var(--coffee-brown)]">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                                        </div>
                                        <span className="text-sm font-medium">{t('admin.settings.taxes.enableTax')}</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.taxes.prefix')}</label>
                                        <input
                                            type="text"
                                            value={settings['invoice_prefix'] || 'INV-2025-'}
                                            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)] font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.taxes.standardRate')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin.settings.taxes.reducedRate')}</label>
                                        <div className="relative max-w-xs">
                                            <input
                                                type="number"
                                                value={settings['tax_rate_reduced'] || '5.5'}
                                                onChange={(e) => handleChange('tax_rate_reduced', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{t('admin.settings.taxes.reducedDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={settings['support_email'] || ''}
                                        onChange={(e) => handleChange('support_email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="support@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['support_phone'] || ''}
                                        onChange={(e) => handleChange('support_phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Email (Public Display)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={settings['store_email'] || ''}
                                        onChange={(e) => handleChange('store_email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="contact@yement-market.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Phone (Public Display)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['store_phone'] || ''}
                                        onChange={(e) => handleChange('store_phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Address</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['store_address'] || ''}
                                        onChange={(e) => handleChange('store_address', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="123 Main St, Paris, France"
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp (Full URL or Phone)</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_whatsapp'] || ''}
                                        onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="https://wa.me/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter / X URL</label>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_twitter'] || ''}
                                        onChange={(e) => handleChange('social_twitter', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok URL</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={settings['social_tiktok'] || ''}
                                        onChange={(e) => handleChange('social_tiktok', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube URL</label>
                                <div className="relative">
                                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_youtube'] || ''}
                                        onChange={(e) => handleChange('social_youtube', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Snapchat URL</label>
                                <div className="relative">
                                    <Ghost className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_snapchat'] || ''}
                                        onChange={(e) => handleChange('social_snapchat', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings['social_linkedin'] || ''}
                                        onChange={(e) => handleChange('social_linkedin', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin.settings.tabs.theme')}</label>
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
                                <h3 className="text-lg font-medium border-b pb-2">{t('admin.settings.payments.stripe')}</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.payments.publicKey')}</label>
                                    <input
                                        type="text"
                                        value={settings['stripe_publishable_key'] || ''}
                                        onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="pk_test_..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.payments.secretKey')}</label>
                                    <input
                                        type="password"
                                        value={settings['stripe_secret_key'] || ''}
                                        onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="sk_test_..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.payments.webhookSecret')}</label>
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
                                <h3 className="text-lg font-medium border-b pb-2">{t('admin.settings.payments.paypal')}</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.payments.clientId')}</label>
                                    <input
                                        type="text"
                                        value={settings['paypal_client_id'] || ''}
                                        onChange={(e) => handleChange('paypal_client_id', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.payments.secretKey')}</label>
                                    <input
                                        type="password"
                                        value={settings['paypal_secret_key'] || ''}
                                        onChange={(e) => handleChange('paypal_secret_key', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">{t('admin.settings.payments.manual')}</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.settings.payments.cod')}</label>
                                        <p className="text-xs text-gray-500">{t('admin.settings.payments.codDesc')}</p>
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
                                <h3 className="text-lg font-medium">{t('admin.settings.email.title')}</h3>
                                <button
                                    onClick={handleSendTestEmail}
                                    className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    {t('admin.settings.email.sendTest')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.host')}</label>
                                    <input
                                        type="text"
                                        value={settings['smtp_host'] || ''}
                                        onChange={(e) => handleChange('smtp_host', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.port')}</label>
                                    <input
                                        type="number"
                                        value={settings['smtp_port'] || '587'}
                                        onChange={(e) => handleChange('smtp_port', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.username')}</label>
                                    <input
                                        type="text"
                                        value={settings['smtp_user'] || ''}
                                        onChange={(e) => handleChange('smtp_user', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.password')}</label>
                                    <input
                                        type="password"
                                        value={settings['smtp_password'] || ''}
                                        onChange={(e) => handleChange('smtp_password', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.fromEmail')}</label>
                                    <input
                                        type="email"
                                        value={settings['smtp_from_email'] || ''}
                                        onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="no-reply@yemenimarket.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.email.fromName')}</label>
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
                                <h4 className="text-blue-800 font-medium text-sm mb-1">{t('admin.settings.email.tip')}</h4>
                                <p className="text-blue-600 text-xs">
                                    {t('admin.settings.email.tipDesc')}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seasonal' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-lg font-medium">{t('admin.settings.seasonal.title')}</h3>
                                    <p className="text-sm text-gray-500">{t('admin.settings.seasonal.desc')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.settings.seasonal.enable')}</span>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.seasonal.sectionTitle')}</label>
                                    <input
                                        type="text"
                                        value={settings['ramadan_title'] || ''}
                                        onChange={(e) => handleChange('ramadan_title', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Ramadan Kareem Specials"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.seasonal.subtitle')}</label>
                                    <textarea
                                        rows={2}
                                        value={settings['ramadan_subtitle'] || ''}
                                        onChange={(e) => handleChange('ramadan_subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Discover our curated selection..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.settings.seasonal.productIds')}</label>
                                    <input
                                        type="text"
                                        value={settings['ramadan_product_ids'] || '[]'}
                                        onChange={(e) => handleChange('ramadan_product_ids', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="[1, 2, 3]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('admin.settings.seasonal.productIdsDesc')}
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
                                    <h3 className="text-lg font-medium">{t('admin.settings.menus.mainNav')}</h3>
                                    <p className="text-sm text-gray-500">{t('admin.settings.menus.mainNavDesc')}</p>
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
                                    <h3 className="text-lg font-medium">{t('admin.settings.menus.footerLinks')}</h3>
                                    <p className="text-sm text-gray-500">{t('admin.settings.menus.footerLinksDesc')}</p>
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
