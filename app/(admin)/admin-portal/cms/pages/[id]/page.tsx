"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Code, FileText, Search } from "lucide-react";

import StructuredPageForm from "./StructuredPageForm";

interface PageData {
    id?: number;
    title: string;
    slug: string;
    content: string;
    structured_content?: any;
    metaTitle: string;
    metaDescription: string;
    isActive: boolean;
}

export default function CMSPageEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const isNew = id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<PageData>({
        title: '',
        slug: '',
        content: '',
        structured_content: null,
        metaTitle: '',
        metaDescription: '',
        isActive: true
    });

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch(`/api/admin/cms/pages/${id}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setFormData(data);
            } catch (error) {
                console.error(error); // Log error to console
                alert('Failed to load page');
                router.push('/admin-portal/cms/pages');
            } finally {
                setLoading(false);
            }
        };

        if (!isNew) {
            fetchPage();
        }
    }, [id, isNew, router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = isNew ? '/api/admin/cms/pages' : `/api/admin/cms/pages/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin-portal/cms/pages');
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch {
            alert('Operation failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading editor...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm sticky top-6 z-10">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{isNew ? 'Create New Page' : `Edit: ${formData.title}`}</h1>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            {formData.isActive ? 'Published' : 'Draft'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-lg hover:bg-[#5a4635] transition-colors font-medium disabled:opacity-70"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Page'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b dark:border-zinc-800 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                            <FileText className="w-4 h-4" />
                            Page Content
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 font-bold text-lg"
                                placeholder="e.g. About Us"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {formData.structured_content ? (
                            <StructuredPageForm
                                slug={formData.slug}
                                data={formData.structured_content}
                                onChange={(newData) => setFormData({ ...formData, structured_content: newData })}
                            />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                    <span>Content (HTML)</span>
                                    <span className="text-xs text-gray-400 font-normal flex items-center gap-1"><Code className="w-3 h-3" /> Raw HTML Mode</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-[500px] font-mono text-sm p-4 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                                        placeholder="<div class='container'>...</div>"
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded border shadow-sm">
                                        {formData.content.length} chars
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">

                    {/* Status & Visibility */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b dark:border-zinc-800 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                            <Globe className="w-4 h-4" />
                            Visibility
                        </div>

                        <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <span className="text-sm font-medium">Active Status</span>
                            <div className={`relative w-11 h-6 transition flex items-center rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className={`absolute bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">URL Slug</label>
                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 border rounded-lg px-3 py-2">
                                <span className="text-gray-400 text-xs">/</span>
                                <input
                                    type="text"
                                    className="bg-transparent w-full text-sm font-mono focus:outline-none"
                                    placeholder="about-us"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Leave blank to auto-generate from title.</p>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b dark:border-zinc-800 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                            <Search className="w-4 h-4" />
                            SEO optimziation
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                placeholder="Page Title | Brand Name"
                                value={formData.metaTitle || ''}
                                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 text-right">Recommended: 60 chars</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg text-sm h-24 dark:bg-zinc-800 dark:border-zinc-700"
                                placeholder="Brief summary of the page content..."
                                value={formData.metaDescription || ''}
                                onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 text-right">Recommended: 160 chars</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-400 mb-1 truncate">
                                {formData.metaTitle || formData.title || 'Page Title'}
                            </p>
                            <p className="text-[10px] text-green-700 dark:text-green-500 mb-1 truncate">
                                https://example.com/{formData.slug || 'page-slug'}
                            </p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">
                                {formData.metaDescription || 'No description provided. Search engines will generate a snippet from the page content.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
