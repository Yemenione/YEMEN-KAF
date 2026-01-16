import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider } from "@/context/AuthContext";
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Yem Kaf | Command Center",
    description: "Administrative Portal for Yemeni Market",
    robots: "noindex, nofollow"
};

export default function AdminRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900 overflow-x-hidden antialiased flex`}>
                <AuthProvider>
                    <AdminSidebar />
                    <main className="flex-1 p-8 h-screen overflow-y-auto">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}
