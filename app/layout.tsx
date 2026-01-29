import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";
import { getCategoryTreeData } from "@/lib/woocommerce";
import { getShippingRates } from "@/lib/shipping";
import { getAllCities } from "@/lib/shipping-rates";
import BottomNav from "@/components/layout/BottomNav";
import { QuickViewProvider } from "@/context/QuickViewContext";
import GlobalQuickView from "@/components/product/GlobalQuickView";
import CookieBanner from "@/components/cookies/CookieBanner";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaPlus | Salud, Belleza y Bienestar a Domicilio",
  description: "Tu aliado experto en salud. Encuentra medicamentos, dermocosmética y todo para tu bienestar con la rapidez y confianza que mereces. PharmaPlus: Cuidamos de ti, donde estés.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategoryTreeData();
  const shippingRules = await getShippingRates();

  return (
    <html lang="es" suppressHydrationWarning>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <div className="flex flex-col min-h-screen">
                  <Header categories={categories} shippingRules={shippingRules} shippingRates={getAllCities()} />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <CartDrawer />
                  <GlobalQuickView />
                  <BottomNav />
                  <CookieBanner />
                  <WhatsAppButton />
                </div>
                <Toaster position="top-right" richColors />
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
