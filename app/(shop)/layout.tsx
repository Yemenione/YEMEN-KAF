import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import CookieBanner from "@/components/layout/CookieBanner";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NewsletterPopup from "@/components/NewsletterPopup";
import ScrollToTop from "@/components/ScrollToTop";
import { SettingsProvider } from "@/context/SettingsContext";
import "../globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

import { prisma } from "@/lib/prisma";
export async function generateMetadata(): Promise<Metadata> {
  const configs = await prisma.storeConfig.findMany({
    where: {
      key: { in: ['site_name', 'site_description', 'logo_url'] }
    }
  });

  const settings = configs.reduce((acc, curr) => ({
    ...acc,
    [curr.key]: curr.value
  }), {} as Record<string, string>);

  return {
    title: settings['site_name'] || "Yemeni Market - Authentic Goods",
    description: settings['site_description'] || "Premium Yemeni products including Sidr Honey and Coffee.",
    icons: {
      icon: settings['logo_url'] || '/icon.png'
    }
  };
}

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${playfair.variable} ${inter.variable} antialiased bg-[var(--cream-white)] text-[var(--coffee-brown)] pb-32 lg:pb-0 safe-area-pb`}>
        <SettingsProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Navbar />
                    {children}
                    <Footer />
                    <CartDrawer />
                    <WishlistDrawer />
                    <MobileBottomNav />
                    <ScrollToTop />
                    <CookieBanner />
                    <NewsletterPopup />
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
