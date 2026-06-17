import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Landscaip — AI Landscaping Visualization",
    template: "%s | Landscaip",
  },
  description:
    "Upload a photo of your property and get professional landscaping designs in seconds. Powered by AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Landscaip",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Landscaip",
    title: "Landscaip — AI Landscaping Visualization",
    description:
      "Transform your property's landscaping with AI. Upload a photo, pick a style, see results instantly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F8000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans bg-background text-foreground">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
