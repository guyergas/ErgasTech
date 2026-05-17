import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ErgasTech - Tech Strategy & Upgrade for Small Businesses",
  description: "Bring practical technology into your business — from strategy to implementation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Heebo:wght@300;400;500;600;700;800;900&family=Frank+Ruhl+Libre:wght@400;500;700;900&family=Caveat:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
