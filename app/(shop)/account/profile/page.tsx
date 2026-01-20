"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            // Fetch full profile with phone
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/account/profile');
            if (res.ok) {
                const data = await res.json();
                setPhone(data.user.phone || "");
                setAvatar(data.user.avatar || "");
            }
        } catch {
            console.error('Failed to fetch profile');
        }
        // ... (rest of code)
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.info(t('profile.uploadDisabled') || "L'upload d'image est temporairement désactivé.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, phone, avatar }),
            });

            if (res.ok) {
                setMessage(t('profile.success'));
                setTimeout(() => setMessage(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save");
            }
        } catch {
            setError("Unexpected error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-100 pb-8">
                {/* Avatar Circle */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 shadow-inner flex items-center justify-center">
                        {avatar ? (
                            <Image src={avatar} alt="Avatar" width={128} height={128} className="object-cover w-full h-full" />
                        ) : (
                            <User size={64} className="text-gray-300" />
                        )}
                        {/* Uploading indicator removed as part of Firebase removal */}
                    </div>

                    <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg group-hover:bg-[#5a4635]">
                        <Camera size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                    </label>
                </div>

                <div>
                    <h1 className="text-3xl font-serif text-black mb-1">{firstName} {lastName}</h1>
                    <p className="text-gray-500 font-medium">Membre Prestige Yemeni Market</p>
                    <p className="text-xs text-[var(--coffee-brown)]/60 mt-2 uppercase tracking-widest">{user?.email}</p>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
                {/* Personal Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-black border-b border-gray-100 pb-2">{t('account.updateInfo')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{t('profile.firstName')}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{t('profile.lastName')}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{t('profile.email')}</label>
                            <input
                                type="email"
                                className="w-full border-b border-gray-200 py-2 text-base bg-gray-50 cursor-not-allowed"
                                value={user?.email || ""}
                                disabled
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{t('profile.phone')}</label>
                            <input
                                type="tel"
                                className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+967 71 234 5678"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? t('profile.saving') : t('profile.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
