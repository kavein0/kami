import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { getLanguage, getDictionary } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { BackgroundEffects } from "@/components/background-effects";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const dict = await getDictionary();
  
  return {
    title: `MiruVerse — ${dict.home.footerNote.split(' ').slice(0, 3).join(' ')}`,
    description: dict.browse.subtitle,
    keywords: ["anime", "movies", "tracker", "list", "MiruVerse"],
    openGraph: {
      title: "MiruVerse",
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
  const session = await auth();

  const navUser = session?.user ? {
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  } : null;

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-dark-bg min-h-screen relative`} suppressHydrationWarning>
        <BackgroundEffects />
        <DictionaryProvider dict={dict}>
          <Navbar lang={lang} dict={dict.nav} user={navUser} />
          <main className="pb-20 md:pb-0 relative z-10">{children}</main>
          <MobileNav dict={dict.nav} />
          <Analytics />
          <SpeedInsights />
        </DictionaryProvider>
      </body>
    </html>
  );
}
