"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload, Loader2, Image as ImageIcon, Globe, EyeOff, X, Settings } from "lucide-react";
import Link from "next/link";
import { createBlogPost, updateBlogPost } from "@/app/actions/blog";
import { toast } from "sonner";
import Image from "next/image";

interface BlogFormProps {
    post?: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        image: string;
        category: string;
        status: string;
        author?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        translations?: Record<string, any>;
    }
}

export default function BlogForm({ post }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeLang, setActiveLang] = useState('en');

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'French', flag: '🇫🇷' },
        { code: 'ar', label: 'Arabic', flag: '🇾🇪' }
    ];

    const [formData, setFormData] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        excerpt: post?.excerpt || "",
        image: post?.image || "",
        category: post?.category || "General",
        status: post?.status || "DRAFT",
        author: post?.author || "Yem Kaf",
        translations: post?.translations || {}
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'blog');

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: form
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, image: data.path }));
                toast.success("Image téléchargée");
            } else {
                toast.error("Échec du téléchargement");
            }
        } catch {
            toast.error("Erreur réseau");
        } finally {
            setUploading(false);
        }
    };

    const handleAutoTranslate = async () => {
        const sourceText = activeLang === 'en' ? formData.title : formData.translations?.en?.title;
        if (!sourceText) {
            toast.error("Veuillez d'abord saisir un titre en anglais");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: sourceText,
                    targetLangs: languages.filter(l => l.code !== 'en').map(l => l.code)
                })
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    translations: {
                        ...prev.translations,
                        fr: { ...prev.translations?.fr, title: data.translations.fr },
                        ar: { ...prev.translations?.ar, title: data.translations.ar }
                    }
                }));
                toast.success("Traductions générées !");
            }
        } catch {
            toast.error("Échec de la traduction");
        } finally {
            setLoading(false);
        }
    };

    const getValue = (field: 'title' | 'content' | 'excerpt') => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (activeLang === 'en') return (formData as Record<string, any>)[field] || '';
        return formData.translations?.[activeLang]?.[field] || '';
    };

    const setValue = (field: 'title' | 'content' | 'excerpt', val: string) => {
        if (activeLang === 'en') {
            setFormData(prev => ({
                ...prev,
                [field]: val,
                // Auto slugify if title and not editing
                ...(field === 'title' && !post ? { slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') } : {})
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [activeLang]: {
                        ...prev.translations?.[activeLang],
                        [field]: val
                    }
                }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) {
            toast.error("Titre et Slug requis");
            return;
        }

        setLoading(true);
        const res = post
            ? await updateBlogPost(post.id, formData as unknown as Parameters<typeof updateBlogPost>[1])
            : await createBlogPost(formData as unknown as Parameters<typeof createBlogPost>[0]);

        if (res.success) {
            toast.success(post ? "Article mis à jour" : "Article créé");
            router.push("/admin-portal/cms/blog");
            router.refresh();
        } else {
            toast.error("Une erreur est survenue");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin-portal/cms/blog" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{post ? "Modifier l'article" : "Nouvel Article"}</h1>
                        <p className="text-xs text-gray-500">Rédigez du contenu de qualité en plusieurs langues.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg mr-4">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => setActiveLang(lang.code)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code
                                    ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {lang.code}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#5a4635] transition-all disabled:opacity-50"
                    >
                        {(loading || uploading) ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        {activeLang !== 'en' && (
                            <button
                                type="button"
                                onClick={handleAutoTranslate}
                                disabled={loading}
                                className="w-full py-2 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-900/30 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : '✨'} Traduire automatiquement depuis l&apos;anglais
                            </button>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                Titre de l&apos;article ({activeLang.toUpperCase()})
                            </label>
                            <input
                                required={activeLang === 'en'}
                                type="text"
                                value={getValue('title')}
                                onChange={(e) => setValue('title', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[var(--coffee-brown)]/20 rounded-lg px-4 py-3 outline-none transition-all text-xl font-bold"
                                placeholder="Ex: Les bienfaits du miel de Sidr..."
                                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {activeLang === 'en' && (
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Slug (URL)</label>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg px-4 py-2 border border-transparent">
                                    <span className="text-gray-400 text-sm">/blog/</span>
                                    <input
                                        required
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="bg-transparent outline-none w-full text-sm font-mono"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                Contenu ({activeLang.toUpperCase()})
                            </label>
                            <textarea
                                value={getValue('content')}
                                onChange={(e) => setValue('content', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[var(--coffee-brown)]/20 rounded-lg px-4 py-3 outline-none transition-all min-h-[500px] leading-relaxed"
                                placeholder="Écrivez votre article ici... (Supporte le HTML)"
                                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2 pb-2 border-b dark:border-zinc-800">
                            <Settings size={18} className="text-[var(--coffee-brown)]" />
                            Publication
                        </h3>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Statut</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${formData.status === "DRAFT"
                                        ? "bg-zinc-100 border-zinc-200 text-zinc-900"
                                        : "bg-transparent border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <EyeOff size={14} /> Brouillon
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${formData.status === "PUBLISHED"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-transparent border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <Globe size={14} /> Publié
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg px-3 py-2 text-sm font-bold outline-none ring-1 ring-gray-100 dark:ring-zinc-700"
                            >
                                <option value="General">Général</option>
                                <option value="Sante">Santé & Bien-être</option>
                                <option value="Tradition">Tradition & Culture</option>
                                <option value="Produit">Guides Produits</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2 pb-2 border-b dark:border-zinc-800">
                            <ImageIcon size={18} className="text-[var(--coffee-brown)]" />
                            Image à la une
                        </h3>

                        <div className="relative aspect-video bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center group">
                            {formData.image ? (
                                <>
                                    <Image src={formData.image} alt="Featured" fill className="object-cover" sizes="300px" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                                            <Upload size={18} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="bg-white text-red-600 p-2 rounded-full hover:scale-110 transition-transform"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-[var(--coffee-brown)] transition-colors">
                                    <Upload size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Télécharger</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                            Extrait / Résumé ({activeLang.toUpperCase()})
                        </label>
                        <textarea
                            value={getValue('excerpt')}
                            onChange={(e) => setValue('excerpt', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[var(--coffee-brown)]/20 rounded-lg px-4 py-3 outline-none transition-all text-sm h-32 resize-none"
                            placeholder="Un court résumé pour les cartes d'articles..."
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
