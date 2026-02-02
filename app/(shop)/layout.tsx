import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { AddressProvider } from "@/context/AddressContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { CompareProvider } from "@/context/CompareContext";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import "../globals.css";

// Dynamic imports for secondary UI elements to reduce initial JS load
const CookieBanner = dynamic(() => import("@/components/layout/CookieBanner"));
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"));
const WishlistDrawer = dynamic(() => import("@/components/wishlist/WishlistDrawer"));
const CompareDrawer = dynamic(() => import("@/components/shop/CompareDrawer"));
const Footer = dynamic(() => import("@/components/layout/Footer"));
const MobileBottomNav = dynamic(() => import("@/components/layout/MobileBottomNav"));
const NewsletterPopup = dynamic(() => import("@/components/NewsletterPopup"));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));

import Navbar from "@/components/layout/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap', // Optimization: show fallback font while loading
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yemenimarket.fr'),
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
      url: 'https://yemenimarket.fr',
      siteName: settings['site_name'] || 'Yemen Kaf',
      images: [
        {
          url: '/images/logo-circle.png',
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
      images: ['/images/logo-circle.png'],
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

const getCachedNavbarData = unstable_cache(
  async () => {
    try {
      const [categories, featuredProducts, headerSettings] = await Promise.all([
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, name: true, slug: true }
        }),
        prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, price: true, images: true }
        }),
        prisma.storeConfig.findMany({
          where: {
            key: {
              in: ['menu_main', 'show_marquee', 'header_sticky', 'header_layout', 'logo_width_desktop', 'logo_url', 'site_name', 'marquee_text_en', 'marquee_text_fr', 'marquee_text_ar']
            }
          }
        })
      ]);

      const settings = headerSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      return {
        categories: categories.map(c => ({ ...c, id: Number(c.id) })),
        featuredProducts: featuredProducts.map(p => ({
          id: Number(p.id),
          name: p.name,
          slug: p.slug,
          price: p.price.toString(),
          images: p.images || undefined
        })),
        settings
      };
    } catch (error) {
      console.error("Error fetching navbar data:", error);
      return { categories: [], featuredProducts: [], settings: {} };
    }
  },
  ['navbar-data'],
  { revalidate: 300, tags: ['settings', 'categories', 'products'] } // 5 minutes
);

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const { categories, featuredProducts, settings } = await getCachedNavbarData();

  return (
    <html lang={lang}>
      <body suppressHydrationWarning className={`${playfair.variable} ${inter.variable} antialiased bg-[var(--cream-white)] text-[var(--coffee-brown)] pb-32 lg:pb-0 safe-area-pb`}>
        <SettingsProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <AddressProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <CompareProvider>
                        <Navbar
                          initialCategories={categories}
                          initialFeaturedProducts={featuredProducts}
                          headerSettings={settings}
                        />
                        {children}
                        <Footer />
                        <CartDrawer />
                        <WishlistDrawer />
                        <CompareDrawer />
                        <MobileBottomNav />
                        <ScrollToTop />
                        <CookieBanner />
                        <NewsletterPopup />
                      </CompareProvider>
                    </WishlistProvider>
                  </CartProvider>
                </AddressProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </SettingsProvider>
        {/* Suppress 404 errors for missing images in development */}
        {process.env.NODE_ENV === 'development' && (
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0];
                  if (typeof msg === 'string' && (
                    msg.includes('Failed to load resource') ||
                    msg.includes('404') ||
                    msg.includes('/uploads/')
                  )) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `
          }} />
        )}
      </body>
    </html>
  );
}
// Force rebuild for mobile nav
