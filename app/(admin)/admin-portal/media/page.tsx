
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Search, Image as ImageIcon, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';

interface MediaFile {
    id: number;
    filename: string;
    originalName: string;
    path: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

export default function MediaLibraryPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: search
            });
            const res = await fetch(`/api/admin/media?${params}`);
            const data = await res.json();
            if (data.data) {
                setFiles(data.data);
                setTotalPages(data.meta.totalPages);
            }
        } catch (error) {
            console.error('Failed to load media', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('file', file);
        });

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                fetchMedia(); // Refresh grid
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/media/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setFiles(files.filter(f => f.id !== id));
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Delete error', error);
        }
    };

    const copyToClipboard = (path: string) => {
        navigator.clipboard.writeText(path);
        alert('Path copied to clipboard!');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Media Library
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage all images and files.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Upload New</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={handleUpload}
                        // multiple // API supports single for now, can be enhanced
                        />
                    </label>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search filename..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)] w-full"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    ))
                ) : files.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No media files found.
                    </div>
                ) : (
                    files.map((file) => (
                        <div key={file.id} className="group relative aspect-square bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            {file.mimeType.startsWith('image/') ? (
                                <Image
                                    src={file.path}
                                    alt={file.originalName}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <span className="text-xs uppercase font-bold">{file.mimeType.split('/')[1]}</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                                <p className="text-xs truncate font-medium mb-2">{file.originalName}</p>
                                <div className="flex justify-between gap-1">
                                    <button
                                        onClick={() => copyToClipboard(file.path)}
                                        className="p-1.5 hover:bg-white/20 rounded text-xs flex-1 text-center"
                                        title="Copy URL"
                                    >
                                        <Copy className="w-3 h-3 mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-1.5 hover:bg-red-500/80 bg-red-500/20 text-red-100 rounded text-xs flex-1 text-center"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
