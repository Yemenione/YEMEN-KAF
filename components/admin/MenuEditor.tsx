'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ArrowUp, ArrowDown, Link as LinkIcon, FileText, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MenuItem {
    label: string;
    href: string;
    type?: 'custom' | 'page' | 'category';
}

interface MenuEditorProps {
    value: string; // JSON string
    onChange: (json: string) => void;
}

export default function MenuEditor({ value, onChange }: MenuEditorProps) {
    const { t } = useLanguage();
    const [items, setItems] = useState<MenuItem[]>(() => {
        try {
            return value ? JSON.parse(value) : [];
        } catch {
            return [];
        }
    });

    const [newItem, setNewItem] = useState<MenuItem>({ label: '', href: '', type: 'custom' });
    const [pages, setPages] = useState<{ id: number; title: string; slug: string }[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);

    useEffect(() => {
        try {
            setItems(value ? JSON.parse(value) : []);
        } catch {
            setItems([]);
        }
    }, [value]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pagesRes, catsRes] = await Promise.all([
                    fetch('/api/admin/cms/pages'),
                    fetch('/api/categories')
                ]);
                if (pagesRes.ok) {
                    const data = await pagesRes.json();
                    setPages(data.pages || []);
                }
                if (catsRes.ok) {
                    const data = await catsRes.json();
                    setCategories(data.categories || []);
                }
            } catch (error) {
                console.error("Failed to fetch menu options", error);
            }
        };
        fetchData();
    }, []);

    const updateItems = (newItems: MenuItem[]) => {
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const add = () => {
        if (!newItem.label || !newItem.href) return;
        updateItems([...items, newItem]);
        setNewItem({ label: '', href: '', type: 'custom' });
    };

    const remove = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        updateItems(next);
    };

    const move = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const next = [...items];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
        updateItems(next);
    };

    const handleQuickSelect = (type: 'page' | 'category', item: any) => {
        if (type === 'page') {
            setNewItem({
                label: item.title,
                href: `/${item.slug}`,
                type: 'page'
            });
        } else {
            setNewItem({
                label: item.name,
                href: `/shop?category=${item.id}`,
                type: 'category'
            });
        }
    };

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50 dark:bg-zinc-800/10">
            {/* List */}
            <div className="space-y-2">
                {items.length === 0 && <p className="text-sm text-gray-500 italic">No links defined.</p>}

                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded border border-gray-100 dark:border-zinc-800">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-0.5">
                            <button onClick={() => move(i, 'up')} disabled={i === 0} className="text-gray-400 hover:text-black disabled:opacity-30">
                                <ArrowUp size={12} />
                            </button>
                            <button onClick={() => move(i, 'down')} disabled={i === items.length - 1} className="text-gray-400 hover:text-black disabled:opacity-30">
                                <ArrowDown size={12} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-2 grayscale opacity-40">
                            {item.type === 'page' ? <FileText size={14} /> : item.type === 'category' ? <LayoutGrid size={14} /> : <LinkIcon size={14} />}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-gray-500 font-mono text-xs truncate">{item.href}</span>
                        </div>

                        <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Quick Tools */}
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-100 dark:border-zinc-800">
                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Add Page</label>
                    <select
                        className="w-full text-xs p-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        onChange={(e) => {
                            const p = pages.find(p => p.id === parseInt(e.target.value));
                            if (p) handleQuickSelect('page', p);
                        }}
                        value=""
                    >
                        <option value="">Select Page...</option>
                        {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Add Category</label>
                    <select
                        className="w-full text-xs p-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        onChange={(e) => {
                            const c = categories.find(c => c.id === parseInt(e.target.value));
                            if (c) handleQuickSelect('category', c);
                        }}
                        value=""
                    >
                        <option value="">Select Category...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Add New Form */}
            <div className="flex items-end gap-2 pt-2 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Label</label>
                    <input
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700 font-medium"
                        placeholder="e.g Home"
                        value={newItem.label}
                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Link / Path</label>
                    <input
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700 font-mono"
                        placeholder="e.g /shop"
                        value={newItem.href}
                        onChange={e => setNewItem({ ...newItem, href: e.target.value })}
                    />
                </div>
                <button
                    onClick={add}
                    disabled={!newItem.label || !newItem.href}
                    className="h-8 w-8 bg-[var(--coffee-brown)] text-white rounded flex items-center justify-center hover:bg-black disabled:opacity-50 transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
