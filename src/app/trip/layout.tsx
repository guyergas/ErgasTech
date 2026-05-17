import type { Metadata, Viewport } from "next";
import Script from "next/script";
import TripLayout from "@/trip/TripLayout";

export const metadata: Metadata = {
  title: "ErgasTrip — יומן המסע של משפחת ארגס",
  description: "יומן מסע פרטי לשנה בתאילנד ואסיה",
  manifest: "/trip/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ErgasTrip",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/trip/icon-192.svg",
    apple: "/trip/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3A5475",
  width: "device-width",
  initialScale: 1,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Service worker registration */}
      <Script id="sw-register" strategy="afterInteractive">{`
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/trip/sw.js', { scope: '/trip/' })
            .catch(() => {});
        }
      `}</Script>
      <TripLayout>{children}</TripLayout>
    </>
  );
}
