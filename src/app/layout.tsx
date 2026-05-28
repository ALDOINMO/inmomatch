import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InmoMatch",
  description: "Marketplace SaaS inmobiliario para matching colaborativo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
