
"use client";

import { useState, useEffect } from 'react';
import { Menu, Save, Loader2, Plus, X, ListTree, Hash } from 'lucide-react';

interface MenuItem {
    label: string;
    href: string;
}

export default function MenuBuilder() {
    const [mainNav, setMainNav] = useState<MenuItem[]>([]);
    const [footerLinks, setFooterLinks] = useState<MenuItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const configRes = await fetch('/api/admin/config');
            const configs = await configRes.json();

            if (configs.menu_main_nav) {
                setMainNav(JSON.parse(configs.menu_main_nav));
            } else {
                // Default fallback from Navbar.tsx if empty
                setMainNav([
                    { label: 'Our Story', href: '/our-story' },
                    { label: 'The Farms', href: '/the-farms' },
                    { label: 'Shop', href: '/shop' }
                ]);
            }

            if (configs.menu_footer_links) {
                setFooterLinks(JSON.parse(configs.menu_footer_links));
            } else {
                setFooterLinks([
                    { label: 'Contact', href: '/contact' },
                    { label: 'Shipping Policy', href: '/shipping' },
                    { label: 'Privacy Policy', href: '/privacy' }
                ]);
            }
        } catch (error) {
            console.error('Failed to load menu config:', error);
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
                        menu_main_nav: JSON.stringify(mainNav),
                        menu_footer_links: JSON.stringify(footerLinks)
                    }
                })
            });

            if (res.ok) {
                alert('Navigation menus saved!');
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const addLink = (type: 'main' | 'footer') => {
        const newItem = { label: 'New Link', href: '#' };
        if (type === 'main') setMainNav([...mainNav, newItem]);
        else setFooterLinks([...footerLinks, newItem]);
    };

    const removeLink = (index: number, type: 'main' | 'footer') => {
        if (type === 'main') setMainNav(mainNav.filter((_, i) => i !== index));
        else setFooterLinks(footerLinks.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: keyof MenuItem, value: string, type: 'main' | 'footer') => {
        if (type === 'main') {
            const newList = [...mainNav];
            newList[index][field] = value;
            setMainNav(newList);
        } else {
            const newList = [...footerLinks];
            newList[index][field] = value;
            setFooterLinks(newList);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    const MenuSection = ({ title, items, type }: { title: string, items: MenuItem[], type: 'main' | 'footer' }) => (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <ListTree className="w-5 h-5 text-[var(--coffee-brown)]" />
                    {title}
                </h3>
                <button
                    onClick={() => addLink(type)}
                    className="text-xs flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors"
                >
                    <Plus className="w-3 h-3" /> Add Link
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 group animate-in slide-in-from-left-2 fade-in duration-200">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold uppercase">Text</span>
                                <input
                                    className="w-full pl-12 pr-4 py-2 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    value={item.label}
                                    onChange={(e) => updateLink(idx, 'label', e.target.value, type)}
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold uppercase"><Hash className="w-3 h-3 inline" /> URL</span>
                                <input
                                    className="w-full pl-12 pr-4 py-2 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    value={item.href}
                                    placeholder="/contact"
                                    onChange={(e) => updateLink(idx, 'href', e.target.value, type)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => removeLink(idx, type)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-400 italic py-4">No links added to this menu.</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Menu className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Navigation Builder
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your site&apos;s header and footer links.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-md hover:bg-[#5a4635] disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Navigation
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <MenuSection title="Main Navigation (Header)" items={mainNav} type="main" />
                <MenuSection title="Footer Links" items={footerLinks} type="footer" />
            </div>

            <div className="bg-[var(--honey-gold)]/10 p-4 rounded-lg border border-[var(--honey-gold)]/20">
                <p className="text-xs text-[var(--coffee-brown)]">
                    <strong>Note:</strong> Internal links should start with a slash (e.g. <code>/shop</code>). External links should include the full URL (e.g. <code>https://google.com</code>).
                </p>
            </div>
        </div>
    );
}
