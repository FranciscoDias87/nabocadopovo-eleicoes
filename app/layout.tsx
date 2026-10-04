import {Audience} from '@/components/audience';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Na Boca do Povo — Eleições 2026",
  description: "Acompanhe a apuração do Brasil inteiro com dados oficiais do TSE, no Na Boca do Povo.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}<Audience enabled={process.env.VERCEL === "1"}/></body>
    </html>
  );
}
