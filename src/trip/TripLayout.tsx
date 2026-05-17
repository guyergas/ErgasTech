"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { family } from "./data";

// CSS variables injected into trip layout — warm airy palette
const tripStyles = `
  /* Override root layout's dark body for trip section */
  body:has(.trip-root) {
    background: linear-gradient(180deg, #F4F6FA 0%, #ECEFF6 100%) !important;
    color: #2A3E5C !important;
  }
  .trip-root {
    --cream:    #F4EFE3;
    --paper:    #FAF6EC;
    --ivory:    #FCF9F1;
    --ink:      #2A3E5C;
    --ink-2:    #5A6A82;
    --ink-3:    #94A0B5;
    --rule:     rgba(58,84,117,0.14);
    --terra:    #5876A0;
    --terra-d:  #3A5475;
    --ochre:    #C5A14E;
    --jade:     #7A95A8;
    --sky:      #8FA8C4;
    --rose:     #C58FA0;
    --gold:     #C5A14E;
    --shadow-soft: 0 1px 2px rgba(58,84,117,0.04), 0 4px 14px rgba(58,84,117,0.06);
    --shadow-card: 0 2px 6px rgba(58,84,117,0.05), 0 12px 28px rgba(58,84,117,0.08);
    --shadow-lift: 0 8px 24px rgba(58,84,117,0.14), 0 24px 60px rgba(58,84,117,0.18);
  }
  @keyframes trip-float-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes trip-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @keyframes trip-pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
  @keyframes trip-wave { 0%,100% { height: 8px; } 50% { height: 36px; } }
  @keyframes trip-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes trip-spin { to { transform: rotate(360deg); } }
  .trip-float-in { animation: trip-float-in 0.5s ease-out; }
  .trip-serif { font-family: 'Frank Ruhl Libre', 'Times New Roman', serif; font-weight: 500; letter-spacing: -0.01em; }
  .trip-mono  { font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace; }
  .trip-hand  { font-family: 'Caveat', cursive; }
`;

interface TripLayoutProps {
  children: React.ReactNode;
}

export default function TripLayout({ children }: TripLayoutProps) {
  const pathname = usePathname();

  return (
    <>
      <style>{tripStyles}</style>
      <div
        className="trip-root"
        dir="rtl"
        style={{
          minHeight: "100vh",
          fontFamily: "'Heebo', system-ui, sans-serif",
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, #E8EEF6 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, #F0E8D4 0%, transparent 60%),
            linear-gradient(180deg, #F4F6FA 0%, #ECEFF6 100%)`,
          color: "var(--ink)",
        }}
      >
        <TripNav pathname={pathname} />
        <main>{children}</main>
      </div>
    </>
  );
}

function TripNav({ pathname }: { pathname: string }) {
  const items = [
    { href: "/trip", label: "יומן" },
    { href: "/trip/map", label: "מפה" },
    { href: "/trip/replay", label: "ניגון מסע" },
  ];

  const [guestName, setGuestName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trip_guest");
      if (raw) setGuestName(JSON.parse(raw).name ?? null);
      else setGuestName(null);
    } catch { /* ignore */ }
    fetch("/api/trip/auth").then(r => r.json()).then(d => setIsAdmin(!!d.isAdmin));
  }, [pathname]);

  const profileHref = guestName ? "/trip/profile" : `/trip/login?next=${encodeURIComponent(pathname)}`;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250,246,236,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "0.5px solid var(--rule)",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <Link
          href="/trip"
          className="trip-serif"
          style={{ fontSize: 20, fontWeight: 700, color: "var(--terra-d)" }}
        >
          ✦ ארגס
        </Link>
        <div style={{ display: "flex", gap: 4 }}>
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "6px 12px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--terra-d)" : "var(--ink-2)",
                  background: active ? "rgba(88,118,160,0.1)" : "transparent",
                  transition: "all .15s",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* New memory button — admins only */}
        {isAdmin && (
          <Link
            href="/trip/admin"
            title="זיכרון חדש"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "var(--terra)",
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(88,118,160,0.3)",
              flexShrink: 0,
              transition: "all .15s",
            }}
          >
            +
          </Link>
        )}

        {/* Profile / login icon */}
        <Link
          href={profileHref}
          title={guestName ? `הפרופיל של ${guestName}` : "כניסה"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: guestName ? "var(--terra)" : "rgba(88,118,160,0.12)",
            color: guestName ? "#fff" : "var(--ink-3)",
            fontSize: guestName ? 15 : 20,
            fontWeight: 700,
            border: guestName ? "none" : "0.5px solid var(--rule)",
            textDecoration: "none",
            flexShrink: 0,
            transition: "all .15s",
          }}
        >
          {guestName ? guestName.slice(0, 1).toUpperCase() : "👤"}
        </Link>
      </div>
    </nav>
  );
}
