'use client';

import { useState, useEffect } from 'react';
import { Layout, Save, ArrowLeft, Eye, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import MenuEditor from '@/components/admin/MenuEditor';
import { useLanguage } from '@/context/LanguageContext';

export default function HeaderSettingsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config');
            if (res.ok) {
                const data = await res.json();
                setSettings(data.config || {});
            }
        } catch (error) {
            toast.error("Failed to load settings");
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
                body: JSON.stringify({ settings }),
            });

            if (res.ok) {
                toast.success("Header settings updated successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading header settings...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin-portal/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Layout className="w-6 h-6 text-[var(--coffee-brown)]" />
                            Header & Navigation
                        </h1>
                        <p className="text-sm text-gray-500">Manage your website's top navigation, logo, and announcement bar.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Preview Site
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:bg-black transition-all disabled:opacity-50 shadow-sm font-medium"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Menu Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs">Main Navigation Menu</h2>
                        </div>
                        <div className="p-6">
                            <MenuEditor
                                value={settings['menu_main'] || '[]'}
                                onChange={(json) => handleChange('menu_main', json)}
                            />
                            <p className="mt-4 text-xs text-gray-500 italic">
                                * Tip: You can now quickly add internal pages and product categories using the selectors below the list.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs">Announcement Bar (Marquee)</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Enable Top Marquee</span>
                                    <p className="text-xs text-gray-500">Show the scrolling announcement bar at the very top.</p>
                                </div>
                                <button
                                    onClick={() => handleChange('show_marquee', settings['show_marquee'] === 'true' ? 'false' : 'true')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings['show_marquee'] === 'true' ? 'bg-[var(--coffee-brown)]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings['show_marquee'] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marquee Messages</label>
                                <p className="text-xs text-gray-500 mb-3">Enter messages separated by bullet points (•). They will scroll continuously.</p>

                                {/* English */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">🇬🇧 English</label>
                                    <input
                                        type="text"
                                        placeholder="Authentic Yemeni Treasures • Free Shipping over $150 • Premium Sidr Honey"
                                        value={settings['marquee_text_en'] || ''}
                                        onChange={(e) => handleChange('marquee_text_en', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)]"
                                        dir="ltr"
                                    />
                                </div>

                                {/* French */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">🇫🇷 Français</label>
                                    <input
                                        type="text"
                                        placeholder="Trésors Yéménites Authentiques • Livraison Gratuite dès 150€ • Miel Sidr Premium"
                                        value={settings['marquee_text_fr'] || ''}
                                        onChange={(e) => handleChange('marquee_text_fr', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)]"
                                        dir="ltr"
                                    />
                                </div>

                                {/* Arabic */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">🇾🇪 العربية</label>
                                    <input
                                        type="text"
                                        placeholder="كنوز يمنية أصيلة • شحن مجاني للطلبات فوق 150 دولار • عسل السدر الفاخر"
                                        value={settings['marquee_text_ar'] || ''}
                                        onChange={(e) => handleChange('marquee_text_ar', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)]"
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Style & Layout */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs">Style & Display</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Sticky Header</span>
                                    <p className="text-xs text-gray-500">Header stays at the top when scrolling.</p>
                                </div>
                                <button
                                    onClick={() => handleChange('header_sticky', settings['header_sticky'] === 'false' ? 'true' : 'false')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings['header_sticky'] !== 'false' ? 'bg-[var(--coffee-brown)]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings['header_sticky'] !== 'false' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Header Layout</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleChange('header_layout', 'logo-left')}
                                        className={`p-2 border rounded-lg text-xs font-medium text-center ${settings['header_layout'] === 'logo-left' ? 'border-[var(--coffee-brown)] bg-orange-50 text-[var(--coffee-brown)]' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        Logo Left
                                    </button>
                                    <button
                                        onClick={() => handleChange('header_layout', 'logo-center')}
                                        className={`p-2 border rounded-lg text-xs font-medium text-center ${settings['header_layout'] === 'logo-center' ? 'border-[var(--coffee-brown)] bg-orange-50 text-[var(--coffee-brown)]' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        Logo Center
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Width (Desktop)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="40"
                                        max="150"
                                        step="5"
                                        value={settings['logo_width_desktop'] || '48'}
                                        onChange={(e) => handleChange('logo_width_desktop', e.target.value)}
                                        className="flex-1 accent-[var(--coffee-brown)]"
                                    />
                                    <span className="text-xs font-mono w-8">{settings['logo_width_desktop'] || '48'}px</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                                <div className="space-y-3">
                                    {settings['logo_url'] && (
                                        <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <img
                                                src={settings['logo_url']}
                                                alt="Logo Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="/images/logo.png or https://..."
                                        value={settings['logo_url'] || ''}
                                        onChange={(e) => handleChange('logo_url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Enter the URL of your logo image. Upload your logo to <code className="bg-gray-100 px-1 rounded">/public/images/</code> first.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Overlay */}
                    <div className="bg-[var(--coffee-brown)] text-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                            <SettingsIcon className="w-5 h-5 opacity-80" />
                            <h3 className="font-bold">Need Help?</h3>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed">
                            These settings control the visual architecture of your store. Be careful when editing the Main Menu JSON directly; using the editor buttons is recommended for safety.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
