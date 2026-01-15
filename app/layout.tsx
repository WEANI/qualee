import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://qualee.app'),
  title: {
    default: 'Qualee - Boostez vos avis Google avec la gamification',
    template: '%s | Qualee',
  },
  description:
    'Transformez vos clients satisfaits en ambassadeurs avec notre roue de la fortune gamifiée. Augmentez vos avis Google et TripAdvisor facilement.',
  keywords: [
    'avis google',
    'google reviews',
    'gamification',
    'roue de la fortune',
    'fidélisation client',
    'restaurant marketing',
    'hôtel marketing',
    'QR code',
    'avis clients',
    'réputation en ligne',
  ],
  authors: [{ name: 'Qualee' }],
  creator: 'Qualee',
  publisher: 'Qualee',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'th_TH'],
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Qualee',
    title: 'Qualee - Boostez vos avis Google avec la gamification',
    description:
      'Transformez vos clients satisfaits en ambassadeurs avec notre roue de la fortune gamifiée.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Qualee - Gamified Review Booster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qualee - Boostez vos avis Google',
    description: 'La roue gamifiée qui booste vos avis Google et TripAdvisor.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/arco" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
