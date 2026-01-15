"use client";

import Navbar from "@/components/layout/Navbar";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="flex-shrink-0">
                        <AccountSidebar />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
