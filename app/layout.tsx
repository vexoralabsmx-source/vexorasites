import type { Metadata } from "next";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Vexora Sites — Diseña experiencias web cinematográficas", template: "%s · Vexora Sites" },
  description: "Crea sitios multipágina premium con dirección visual, movimiento y publicación integrada, sin escribir código.",
  openGraph: { title: "Vexora Sites", description: "Sitios multipágina con dirección visual de nivel global, sin escribir código.", type: "website", locale: "es_MX", images: [{ url: "/og.png", width: 1734, height: 907, alt: "Vexora Sites, editor visual para experiencias web cinematográficas" }] },
  twitter: { card: "summary_large_image", title: "Vexora Sites", description: "Sitios multipágina con dirección visual de nivel global.", images: ["/og.png"] },
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
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
