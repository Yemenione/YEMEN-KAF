"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Newspaper, Globe, EyeOff, Calendar, LayoutGrid, Menu, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { getAllBlogPosts, deleteBlogPost } from "@/app/actions/blog";
import { toast } from "sonner";
import Image from "next/image";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    image: string | null;
    category: string | null;
    author: string | null;
    status: string;
    views: number;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            const data = await getAllBlogPosts();
            setPosts(data);
            setLoading(false);
        }
        fetchPosts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        const res = await deleteBlogPost(id);
        if (res.success) {
            toast.success("Article supprimé");
            setPosts(posts.filter(p => p.id !== id));
        } else {
            toast.error("Erreur lors de la suppression");
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

            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-gray-500" />
                        Articles du Blog
                    </h2>
                </div>
                <Link
                    href="/admin-portal/cms/blog/new"
                    className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-lg hover:bg-[#5a4635] transition-colors text-sm font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel Article
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Catégorie</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Chargement des articles...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-500 italic">Aucun article trouvé. Commencez à écrire !</td></tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 flex-shrink-0">
                                                {post.image ? (
                                                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                                                ) : (
                                                    <LayoutGrid className="w-5 h-5 absolute inset-0 m-auto text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-gray-500 font-mono">/{post.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {post.category || 'Général'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.status === 'PUBLISHED' ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <Globe className="w-3 h-3" /> Publié
                                            </span>
                                        ) : post.status === 'DRAFT' ? (
                                            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <EyeOff className="w-3 h-3" /> Brouillon
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                Archivé
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin-portal/cms/blog/${post.id}`}
                                                className="p-2 text-gray-400 hover:text-[var(--honey-gold)] hover:bg-gold-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
