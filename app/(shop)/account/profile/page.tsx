"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
    const { user } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
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
                body: JSON.stringify({ firstName, lastName, phone }),
            });

            if (res.ok) {
                setMessage("تم حفظ التغييرات بنجاح!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "فشل حفظ التغييرات");
            }
        } catch (err) {
            setError("حدث خطأ غير متوقع");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">Profile Details / الملف الشخصي</h1>
                <p className="text-gray-500">Update your personal information / تحديث معلوماتك الشخصية</p>
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
                    <h2 className="text-xl font-serif text-black border-b border-gray-100 pb-2">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">First Name / الاسم الأول</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Last Name / اسم العائلة</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email Address / البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="w-full border-b border-gray-200 py-2 text-base bg-gray-50 cursor-not-allowed"
                                value={user?.email || ""}
                                disabled
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed / لا يمكن تغيير البريد الإلكتروني</p>
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Phone Number / رقم الهاتف</label>
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
                        {isLoading ? "جاري الحفظ..." : "Save Changes / حفظ التغييرات"}
                    </button>
                </div>
            </form>
        </div>
    );
}
