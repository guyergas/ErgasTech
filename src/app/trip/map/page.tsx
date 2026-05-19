"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { route, posts, travelSegments, stats as defaultStats, family } from "@/trip/data";
import { useState, useEffect } from "react";
import type { JourneyStats } from "@/trip/data";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, background: "linear-gradient(180deg, #F2E8D4 0%, #E8D8B8 100%)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5A3C", fontSize: 14 }}>
      טוען מפה…
    </div>
  ),
});

const TRANSPORT_ICONS: Record<string, string> = {
  flight: "✈️",
  car: "🚗",
  boat: "⛵",
  train: "🚂",
  walk: "🚶",
};

const CITY_IDS: Record<string, string> = {
  bkk: "בנגקוק", ay: "אַיוּתָיָה", cm: "צ׳יאנג מאי", pai: "פאי", kbi: "קראבי", ph: "פוקט",
};

export default function MapPage() {
  const [selected, setSelected] = useState("bkk");
  const [stats, setStats] = useState<JourneyStats>(defaultStats);
  const sel = route.find((r) => r.id === selected)!;
  const selPosts = posts.filter((p) => p.city === CITY_IDS[selected]);

  useEffect(() => {
    fetch("/api/trip/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(defaultStats));
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px" }}>
        <div className="trip-mono" style={{ fontSize: 10, color: "var(--terra)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
          מפת המסע
        </div>
        <h1 className="trip-serif" style={{ margin: 0, fontSize: 32, fontWeight: 500, color: "var(--terra-d)" }}>
          תאילנד, 2026
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-2)" }}>
          {stats.kms.toLocaleString("he")} ק״מ · {stats.days} ימים · {route.filter(r => !r.future).length} ערים
        </p>
      </div>

      {/* Leaflet Map */}
      <div style={{ margin: "0 16px 16px", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-card)", border: "0.5px solid var(--rule)" }}>
        <TripMap posts={posts} segments={travelSegments} route={route} />
      </div>

      {/* Replay link */}
      <div style={{ padding: "0 16px 12px", display: "flex", justifyContent: "flex-end" }}>
        <Link href="/trip/replay" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, background: "var(--terra-d)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          ▶ ניגון מסע
        </Link>
      </div>

      {/* City selector tabs */}
      <div style={{ padding: "0 16px 12px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, width: "max-content" }}>
          {route.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)}
              style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: selected === r.id ? "var(--terra)" : "rgba(255,255,255,0.7)", color: selected === r.id ? "#fff" : "var(--ink-3)", opacity: r.future ? 0.55 : 1 }}>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected city info */}
      {sel && (
        <div className="trip-float-in" key={selected} style={{ padding: "0 16px 16px" }}>
          <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-card)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <h2 className="trip-serif" style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "var(--ink)" }}>{sel.name}</h2>
              <span className="trip-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>יום {sel.day}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
              {sel.posts} זיכרונות{sel.future ? " · עוד לא הגענו" : " תועדו"}
            </p>
            {selPosts.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {selPosts.slice(0, 2).map((p) => (
                  <Link key={p.id} href={`/trip/post/${p.id}`}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--ivory)", borderRadius: 12, textDecoration: "none", border: "0.5px solid var(--rule)" }}>
                    <span style={{ fontSize: 20 }}>{family[p.authorId]?.glyph}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{p.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Travel segments */}
      <div style={{ padding: "0 16px" }}>
        <h2 className="trip-serif" style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>
          קטעי הנסיעה
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {travelSegments.map((seg) => (
            <div key={seg.id} style={{ background: "rgba(255,255,255,0.8)", borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-soft)", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{TRANSPORT_ICONS[seg.transportType]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{seg.fromName} → {seg.toName}</div>
                {seg.notes && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{seg.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
