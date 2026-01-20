"use client";


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
import { ToastProvider } from "@/context/ToastContext";

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
                            <ToastProvider>
                                <UIProvider>
                                    <AdminSidebar />
                                    <main className="flex-1 p-8 h-screen overflow-y-auto w-full">
                                        {children}
                                    </main>
                                </UIProvider>
                            </ToastProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
