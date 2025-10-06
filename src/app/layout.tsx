// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { robotoRegular, robotoMedium } from "./fonts"; // <-- твои локальные Roboto
import "./globals.css";

// Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Метаданные
export const metadata: Metadata = {
  title: "Links — Полезные ссылки",
  description: "Удобная коллекция полезных ссылок, организованная по категориям. Быстрый доступ к нужным ресурсам.",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      }
    ],
  },
};

// Layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${robotoRegular.variable} ${robotoMedium.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
