import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";

import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yemeni Market | Luxury Sidr Honey & Mocha Coffee",
  description: "Experience the heritage of Yemen with authentic Sidr Honey and premium Mocha Coffee. A journey of luxury and tradition.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-[var(--cream-white)] text-[var(--coffee-brown)]`}
      >
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Footer />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
