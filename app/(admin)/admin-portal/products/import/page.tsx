
'use client';

import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileUp } from 'lucide-react';

export default function ImportProductsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success?: number; failed?: number; errors?: string[]; error?: string; details?: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/imports/products', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ error: 'Upload failed', details: 'Network error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Products</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Bulk import products using CSV files (PrestaShop / WooCommerce format).
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-12 transition-colors hover:border-[var(--coffee-brown)] focus-within:border-[var(--coffee-brown)]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-full">
                                <FileUp className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="text-[var(--coffee-brown)] font-medium hover:underline">Click to upload</span>
                                    <span className="text-gray-500"> or drag and drop</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">CSV files only (max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    {file && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 text-green-600 p-2 rounded">
                                    <Upload size={16} />
                                </div>
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full bg-[var(--coffee-brown)] text-white font-medium py-3 rounded-md hover:bg-[#5a4635] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? 'Processing...' : 'Start Import'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-medium">Import Results</h3>

                    {result.error ? (
                        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-md flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Import Failed</p>
                                <p className="text-sm">{result.details || result.error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-sm text-green-800 font-medium">Successful</p>
                                    <p className="text-2xl font-bold text-green-900">{result.success}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="text-sm text-red-800 font-medium">Failed Items</p>
                                    <p className="text-2xl font-bold text-red-900">{result.failed}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md overflow-hidden">
                            <div className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                                <h4 className="text-sm font-bold">Error Log</h4>
                            </div>
                            <div className="p-4 max-h-60 overflow-y-auto text-sm text-red-600 font-mono space-y-1">
                                {result.errors.map((err: string, i: number) => (
                                    <div key={i}>{err}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
