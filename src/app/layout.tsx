import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Providers } from "@/components/providers";
import { APP_URL } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Lalang — Translate the languages of our islands",
    template: "%s · Lalang",
  },
  description:
    "AI-powered translation between English, French and Mauritian Creole. Built to preserve and promote Kreol Morisien.",
  applicationName: "Lalang",
  keywords: ["Mauritian Creole", "Kreol Morisien", "translation", "French", "English", "Mauritius"],
  openGraph: {
    type: "website",
    siteName: "Lalang",
    title: "Lalang — Translate the languages of our islands",
    description: "AI-powered translation for English, French and Mauritian Creole.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lalang",
    description: "AI-powered translation for English, French and Mauritian Creole.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} font-[family-name:var(--font-body)] antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <ToastProvider>{children}</ToastProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
