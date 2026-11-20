import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { inter, spaceGrotesk } from '@/lib/fonts';
import { StructuredData } from '@/components/structured-data';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { LanguageProvider } from '@/contexts/language-context';
import { LanguageHtmlUpdater } from '@/components/language-html-updater';
import { ConditionalPublicLayout } from '@/components/ConditionalPublicLayout';
import DotField from '@/components/ui/dot-field';
import { SecurityProvider } from '@/components/providers/security-provider';
import { VitalsReporter } from '@/components/vitals-reporter';

const BASE_URL = 'https://mwijayportfolio.vercel.app';

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.toggle('dark', saved === 'dark');
      document.documentElement.setAttribute('data-theme', saved);
    } catch (_) {}
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  })();
`.trim();

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07080c' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | Mwijay Services',
    default: 'Mwijay Services | Web Developer & AI Specialist in Tanzania',
  },
  description: 'Professional web development, AI automation, and digital solutions by Mwijay Davie. Based in Dar es Salaam, Tanzania.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Mwijay Services | Web Developer & AI Specialist',
    description: 'Bespoke digital architecture and AI systems built for the 2026 African business landscape.',
    url: BASE_URL,
    siteName: 'Mwijay Services',
    locale: 'en_TZ',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mwijay Services — Web Developer & AI Specialist in Tanzania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mwijay Services | Creative Technologist',
    description: 'Building high-performance web systems and AI workflows in Tanzania.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <StructuredData />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* LIGHTHOUSE FIX: Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script id="theme-initializer-script" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased bg-background text-foreground relative overflow-x-hidden loading-lock">
        <VitalsReporter />

        <div
          className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <DotField />
        </div>

        <FirebaseClientProvider>
          <LanguageProvider>
            <SecurityProvider>
              <LanguageHtmlUpdater />
              <ConditionalPublicLayout>
                {children}
              </ConditionalPublicLayout>
              <AnalyticsTracker />
              <Toaster />
            </SecurityProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}