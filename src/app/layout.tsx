import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { getLanguage, getDictionary } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DictionaryProvider } from "@/components/dictionary-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const dict = await getDictionary();
  
  return {
    title: `KamiList — ${dict.home.footerNote.split(' ').slice(0, 3).join(' ')}`,
    description: dict.browse.subtitle,
    keywords: ["anime", "movies", "tracker", "list", "KamiList"],
    openGraph: {
      title: "KamiList",
      description: dict.browse.subtitle,
      type: "website",
      locale: lang === "ru" ? "ru_RU" : "en_US",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();
  const dict = await getDictionary();

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-dark-bg min-h-screen`} suppressHydrationWarning>
        <DictionaryProvider dict={dict}>
          <Navbar lang={lang} dict={dict.nav} />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileNav dict={dict.nav} />
          <Analytics />
          <SpeedInsights />
        </DictionaryProvider>
      </body>
    </html>
  );
}
