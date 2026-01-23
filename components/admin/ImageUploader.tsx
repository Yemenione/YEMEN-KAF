'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
}

export default function ImageUploader({ value, onChange, folder = 'uploads', className = '' }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok && data.url) {
                onChange(data.url);
            } else {
                console.error('Upload failed:', data.error);
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 w-32 h-32 flex items-center justify-center">
                    <Image
                        src={value}
                        alt="Uploaded"
                        fill
                        className="object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 bg-white rounded-full text-black hover:bg-gray-100 transition-colors"
                        >
                            <Upload size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                        ${isDragging
                            ? 'border-[var(--coffee-brown)] bg-[var(--coffee-brown)]/5'
                            : 'border-gray-300 dark:border-zinc-700 hover:border-[var(--coffee-brown)] hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }
                    `}
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                        <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">Upload</span>
                        </>
                    )}
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
