"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, FileText, Newspaper, Menu, Save, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useToast } from "@/context/ToastContext";

interface FooterLink {
    label: string;
    href: string;
}

export default function CMSMenusPage() {
    const [links, setLinks] = useState<FooterLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newHref, setNewHref] = useState("");

    const pathname = usePathname();
    const { showToast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config');
            if (res.ok) {
                const data = await res.json();
                if (data.menu_footer_links) {
                    try {
                        const parsed = JSON.parse(data.menu_footer_links);
                        if (Array.isArray(parsed)) {
                            setLinks(parsed);
                        }
                    } catch (e) {
                        console.error("Failed to parse footer links", e);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            showToast("Failed to load menus", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = () => {
        if (!newLabel || !newHref) {
            showToast("Please enter both label and URL", "error");
            return;
        }
        setLinks([...links, { label: newLabel, href: newHref }]);
        setNewLabel("");
        setNewHref("");
    };

    const handleDeleteLink = (index: number) => {
        const newLinks = [...links];
        newLinks.splice(index, 1);
        setLinks(newLinks);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        menu_footer_links: JSON.stringify(links)
                    }
                })
            });

            if (res.ok) {
                showToast("Menu updated successfully", "success");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            showToast("Failed to save menu changes", "error");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Unified CMS Header with Tabs */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-[var(--coffee-brown)] dark:text-white">Gestion du Contenu (CMS)</h1>
                        <p className="text-gray-500 text-sm">Gérez les pages statiques, les articles de blog et les menus.</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
                    <Link
                        href="/admin-portal/cms/pages"
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            pathname === "/admin-portal/cms/pages" ? "bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <FileText size={16} /> Pages CMS
                    </Link>
                    <Link
                        href="/admin-portal/cms/blog"
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            pathname.startsWith("/admin-portal/cms/blog") ? "bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Newspaper size={16} /> Articles du Blog
                    </Link>
                    <Link
                        href="/admin-portal/cms/menus"
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            pathname === "/admin-portal/cms/menus" ? "bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Menu size={16} /> Menus & Navigation
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Visual Editor Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Menu className="w-5 h-5 text-gray-500" />
                                Footer Menu Links
                            </h2>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-lg hover:bg-[#5a4635] transition-colors text-sm font-bold disabled:opacity-50"
                            >
                                {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>

                        {/* Add New Link Form */}
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg mb-6 border border-gray-100 dark:border-zinc-700">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Add New Link</h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Link Label</label>
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder="e.g. Terms of Service"
                                        className="w-full px-3 py-2 border rounded-md text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[var(--honey-gold)] outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">URL / Path</label>
                                    <input
                                        type="text"
                                        value={newHref}
                                        onChange={(e) => setNewHref(e.target.value)}
                                        placeholder="e.g. /terms or https://google.com"
                                        className="w-full px-3 py-2 border rounded-md text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[var(--honey-gold)] outline-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddLink}
                                        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
                                        title="Add Link"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Links List */}
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-center text-gray-500 py-8">Loading menu...</p>
                            ) : links.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 dark:bg-zinc-800/30 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500">No links in footer menu yet.</p>
                                </div>
                            ) : (
                                links.map((link, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded text-gray-400">
                                                <ExternalLink size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{link.label}</p>
                                                <p className="text-xs text-gray-500 font-mono">{link.href}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteLink(idx)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Link"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Helpful Tips Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-6 rounded-xl">
                        <h3 className="font-bold text-[var(--coffee-brown)] mb-3 flex items-center gap-2">
                            <span className="bg-[var(--coffee-brown)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">?</span>
                            Quick Tips
                        </h3>
                        <ul className="space-y-3 text-sm text-[var(--coffee-brown)]/80">
                            <li className="flex gap-2">
                                <span className="mt-1">•</span>
                                <span>Use relative paths like <code>/shop</code> for internal pages.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1">•</span>
                                <span>Use full URLs like <code>https://instagram.com</code> for external sites.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1">•</span>
                                <span>Drag and drop reordering is coming soon! For now, delete and re-add to change order.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
