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
import { AddressProvider } from "@/context/AddressContext";
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yemen-kaf.vercel.app'),
    title: {
      default: settings['site_name'] || "Yemen Kaf - Luxury Yemeni Gourmet & Sidr Honey Europe",
      template: `%s | ${settings['site_name'] || "Yemen Kaf"}`
    },
    description: settings['site_description'] || "The premier destination for authentic Yemeni luxury: Premium Sidr Honey, Organic Qishr Coffee, and Traditional Spices delivered across France and Europe.",
    keywords: [
      "Yemen Kaf", "Yemeni Market France", "Sidr Honey Europe", "Miel de Sidr France",
      "Café du Yémen", "Yemeni Coffee Europe", "Produits Yéménites", "Luxury Gourmet Yemen",
      "Epicerie Fine Yéménite", "Bakhoor Europe", "Yemen Gourmet Marketplace"
    ],
    authors: [{ name: "Yemen Kaf" }],
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      alternateLocale: ['en_US', 'ar_YE'],
      url: 'https://yemen-kaf.vercel.app',
      siteName: 'Yemen Kaf',
      images: [
        {
          url: '/images/logo.png',
          width: 1200,
          height: 630,
          alt: 'Yemen Kaf - Luxury Yemeni Gourmet',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Yemen Kaf - Luxury Yemeni Gourmet',
      description: 'Authentic Yemeni treasures delivered across Europe.',
      images: ['/images/logo.png'],
    },
    alternates: {
      canonical: '/',
      languages: {
        'fr-FR': '/fr',
        'en-US': '/en',
        'ar-YE': '/ar',
      },
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
                <AddressProvider>
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
                </AddressProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
// Force rebuild for mobile nav
