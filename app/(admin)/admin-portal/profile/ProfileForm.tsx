"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Loader2, User, Lock, Bell, Moon, Sun, Monitor, Save, Shield } from "lucide-react";

interface Admin {
    id: string | number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
}

export default function ProfileForm({ admin }: { admin: Admin }) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: admin.name || '',
        email: admin.email || '',
        phone: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [avatarUrl] = useState(admin?.avatar || '/images/placeholder-user.jpg');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        alert("Profile updated successfully!");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar / User Card */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg relative">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--coffee-brown)] flex items-center justify-center text-white font-bold text-3xl">
                                    {admin.name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-1 bg-[var(--coffee-brown)] text-white p-2.5 rounded-full shadow-lg hover:bg-[#5a4635] transition-transform hover:scale-105">
                            <Camera size={16} />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{admin.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{admin.email}</p>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">
                        <Shield size={12} fill="currentColor" />
                        {admin.role}
                    </div>
                </div>

                <nav className="bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile'
                            ? 'bg-[var(--coffee-brown)] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <User size={18} />
                        Personal Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security'
                            ? 'bg-[var(--coffee-brown)] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <Lock size={18} />
                        Login & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'preferences'
                            ? 'bg-[var(--coffee-brown)] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <Bell size={18} />
                        Preferences
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {activeTab === 'profile' && 'Edit Profile'}
                            {activeTab === 'security' && 'Security Settings'}
                            {activeTab === 'preferences' && 'System Preferences'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {activeTab === 'profile' && 'Update your personal details and public profile.'}
                            {activeTab === 'security' && 'Manage your password and security questions.'}
                            {activeTab === 'preferences' && 'Customize your admin dashboard experience.'}
                        </p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-500 cursor-not-allowed"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+33 6 ..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio / Notes</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Write a short bio..."
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[var(--coffee-brown)] text-white px-6 py-2.5 rounded-lg hover:bg-[#5a4635] flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Repeat new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[var(--coffee-brown)] text-white px-6 py-2.5 rounded-lg hover:bg-[#5a4635] flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Appearance</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[var(--coffee-brown)] transition-all">
                                        <Sun className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium">Light</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[var(--coffee-brown)] bg-white dark:bg-zinc-800 shadow-sm">
                                        <Moon className="w-6 h-6 text-[var(--coffee-brown)]" />
                                        <span className="text-sm font-bold text-[var(--coffee-brown)]">Dark</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[var(--coffee-brown)] transition-all">
                                        <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                                    <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Notifications</h4>
                                    <div className="space-y-3">
                                        {['Email notifications for new orders', 'Weekly summary reports', 'System security alerts'].map((item, i) => (
                                            <label key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                    <input type="checkbox" name="toggle" id={`toggle-${i}`} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[var(--coffee-brown)]" />
                                                    <label htmlFor={`toggle-${i}`} className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-[var(--coffee-brown)]"></label>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
