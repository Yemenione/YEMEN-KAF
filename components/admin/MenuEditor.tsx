'use client';

import { useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

interface MenuItem {
    label: string;
    href: string;
}

interface MenuEditorProps {
    value: string; // JSON string
    onChange: (json: string) => void;
}

export default function MenuEditor({ value, onChange }: MenuEditorProps) {
    const [items, setItems] = useState<MenuItem[]>(() => {
        try {
            return value ? JSON.parse(value) : [];
        } catch {
            return [];
        }
    });

    const [newItem, setNewItem] = useState({ label: '', href: '' });

    const updateItems = (newItems: MenuItem[]) => {
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const add = () => {
        if (!newItem.label || !newItem.href) return;
        updateItems([...items, newItem]);
        setNewItem({ label: '', href: '' });
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

            {/* Add New */}
            <div className="flex items-end gap-2 pt-2 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Label</label>
                    <input
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="e.g Home"
                        value={newItem.label}
                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Link</label>
                    <input
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="e.g /shop"
                        value={newItem.href}
                        onChange={e => setNewItem({ ...newItem, href: e.target.value })}
                    />
                </div>
                <button
                    onClick={add}
                    disabled={!newItem.label || !newItem.href}
                    className="h-8 w-8 bg-[var(--coffee-brown)] text-white rounded flex items-center justify-center hover:bg-black disabled:opacity-50"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
