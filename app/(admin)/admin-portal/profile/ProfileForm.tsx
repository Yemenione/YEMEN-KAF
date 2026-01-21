"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

interface Admin {
    id: string | number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
}


export default function ProfileForm({ admin }: { admin: Admin }) {
    const [uploading] = useState(false);
    const [avatarUrl] = useState(admin?.avatar || '/images/placeholder-user.jpg');
    const [message, setMessage] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMessage("L'upload d'avatar est temporairement désactivé (migration Firebase).");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl">
            <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50 relative">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                sizes="128px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                                AD
                            </div>
                        )}
                    </div>

                    <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-gray-800 transition-colors">
                        <Camera size={18} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-bold">{admin?.name || 'Admin'}</h2>
                    <p className="text-gray-500 text-sm">{admin?.email}</p>
                </div>
            </div>

            {uploading && (
                <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm font-medium">Uploading new avatar...</span>
                </div>
            )}

            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium mb-4 text-center ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message}
                </div>
            )}

            <div className="border-t border-gray-100 pt-6 mt-2">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">Account Details</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium">{admin?.role}</div>
                    </div>
                    {/* Additional fields could go here */}
                </div>
            </div>
        </div>
    );
}
