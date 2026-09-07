import type { Metadata } from "next";
import { Lora, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mcgutm.org");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Home" });
  const isZh = locale === "zh-TW";
  const defaultTitle = "Mandarin Care Group | UTM";
  const description = t("description");
  const canonicalUrl = `/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: "%s | Mandarin Care Group | UTM",
    },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: "/en",
        "zh-TW": "/zh-TW",
      },
    },
    openGraph: {
      title: defaultTitle,
      description,
      url: canonicalUrl,
      siteName: "Mandarin Care Group | UTM",
      locale: isZh ? "zh_TW" : "en_US",
      alternateLocale: isZh ? ["en_US"] : ["zh_TW"],
      type: "website",
      images: [
        {
          url: "/icon.png",
          width: 512,
          height: 512,
          type: "image/png",
          alt: "Mandarin Care Group | UTM Logo",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: defaultTitle,
      description,
      images: ["/icon.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${lora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <GlobalAudioPlayer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
