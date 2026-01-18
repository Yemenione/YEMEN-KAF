"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

// ... imports
import { UIProvider } from "@/context/UIContext";

export default function AdminRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900 overflow-x-hidden antialiased flex`}>
                <LanguageProvider>
                    <AuthProvider>
                        <SettingsProvider>
                            <UIProvider>
                                <AdminSidebar />
                                <main className="flex-1 p-8 h-screen overflow-y-auto w-full">
                                    {children}
                                </main>
                            </UIProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
