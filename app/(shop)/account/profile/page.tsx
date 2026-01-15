"use client";

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">Profile Details</h1>
                <p className="text-gray-500">Update your personal information and password.</p>
            </div>

            <form className="max-w-2xl space-y-8">
                {/* Personal Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-serif text-black border-b border-gray-100 pb-2">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                            <input type="text" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" defaultValue="Ali" />
                        </div>
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Last Name</label>
                            <input type="text" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" defaultValue="Latif" />
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                            <input type="email" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" defaultValue="ali@example.com" />
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                            <input type="tel" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" defaultValue="+967 71 234 5678" />
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="space-y-6 pt-6">
                    <h2 className="text-xl font-serif text-black border-b border-gray-100 pb-2">Change Password</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
                            <input type="password" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" />
                        </div>
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">New Password</label>
                            <input type="password" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" />
                        </div>
                        <div className="group">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Confirm New Password</label>
                            <input type="password" className="w-full border-b border-gray-200 py-2 text-base focus:border-black outline-none transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="button" className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-bold hover:bg-gray-800 transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
