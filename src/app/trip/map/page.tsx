"use client";

import Link from "next/link";
import { route, posts, travelSegments, stats, family } from "@/trip/data";
import { useState } from "react";

const TRANSPORT_ICONS: Record<string, string> = {
  flight: "✈️",
  car: "🚗",
  boat: "⛵",
  train: "🚂",
  walk: "🚶",
};

export default function MapPage() {
  const [selected, setSelected] = useState("bkk");
  const sel = route.find((r) => r.id === selected)!;
  const selPosts = posts.filter((p) => p.city === sel?.en || p.city === (
    { bkk: "בנגקוק", ay: "אַיוּתָיָה", cm: "צ׳יאנג מאי", pai: "פאי", kbi: "קראבי", ph: "פוקט" }[selected] || ""
  ));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px" }}>
        <div
          className="trip-mono"
          style={{
            fontSize: 10,
            color: "var(--terra)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          מפת המסע
        </div>
        <h1
          className="trip-serif"
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 500,
            color: "var(--terra-d)",
          }}
        >
          תאילנד, 2026
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-2)" }}>
          {stats.kms.toLocaleString("he")} ק״מ · {stats.days} ימים · {route.filter(r => !r.future).length} עיר
        </p>
      </div>

      {/* Map SVG */}
      <div
        style={{
          margin: "0 16px 16px",
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(180deg, #F2E8D4 0%, #E8D8B8 100%)",
          border: "0.5px solid var(--rule)",
          position: "relative",
        }}
      >
        <svg
          viewBox="0 0 320 430"
          style={{ width: "100%", display: "block" }}
        >
          {/* Topographic lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={i}
              cx={160 + Math.sin(i) * 8}
              cy={200 + i * 10}
              rx={110 + i * 12}
              ry={60 + i * 7}
              fill="none"
              stroke="#8B5A3C"
              strokeWidth="0.4"
              opacity={0.15}
            />
          ))}

          {/* Route lines */}
          {route.slice(0, -1).map((r, i) => {
            const next = route[i + 1];
            if (!next) return null;
            return (
              <line
                key={r.id}
                x1={r.x}
                y1={r.y}
                x2={next.x}
                y2={next.y}
                stroke={next.future ? "var(--rule, rgba(58,84,117,0.14))" : "var(--terra)"}
                strokeWidth={next.future ? 1 : 1.5}
                strokeDasharray={next.future ? "4 4" : "none"}
                opacity={0.6}
              />
            );
          })}

          {/* Route points */}
          {route.map((r) => {
            const isSel = r.id === selected;
            const isFuture = r.future;
            return (
              <g key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelected(r.id)}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={isSel ? 10 : 7}
                  fill={isFuture ? "var(--rule)" : isSel ? "var(--terra-d)" : "var(--terra)"}
                  opacity={isFuture ? 0.5 : 1}
                  stroke="#fff"
                  strokeWidth={isSel ? 2.5 : 1.5}
                />
                <text
                  x={r.x + 14}
                  y={r.y + 4}
                  fontSize={10}
                  fill={isFuture ? "var(--ink-3)" : "var(--ink)"}
                  fontFamily="'Heebo', sans-serif"
                  fontWeight={isSel ? "700" : "500"}
                  opacity={isFuture ? 0.5 : 1}
                >
                  {r.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Replay button */}
        <Link
          href="/trip/replay"
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 100,
            background: "var(--terra-d)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(58,84,117,0.3)",
          }}
        >
          ▶ ניגון מסע
        </Link>
      </div>

      {/* Selected city info */}
      {sel && (
        <div
          className="trip-float-in"
          key={selected}
          style={{ padding: "0 16px 16px" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: 20,
              padding: "16px 18px",
              boxShadow: "var(--shadow-card)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <h2
                className="trip-serif"
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {sel.name}
              </h2>
              <span
                className="trip-mono"
                style={{ fontSize: 10, color: "var(--ink-3)" }}
              >
                יום {sel.day}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
              {sel.posts} זיכרונות{sel.future ? " · עוד לא הגענו" : " תועדו"}
            </p>

            {selPosts.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {selPosts.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    href={`/trip/post/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "var(--ivory)",
                      borderRadius: 12,
                      textDecoration: "none",
                      border: "0.5px solid var(--rule)",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{family[p.authorId]?.glyph}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                      {p.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Travel segments */}
      <div style={{ padding: "0 16px" }}>
        <h2
          className="trip-serif"
          style={{
            margin: "0 0 12px",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          קטעי הנסיעה
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {travelSegments.map((seg) => (
            <div
              key={seg.id}
              style={{
                background: "rgba(255,255,255,0.8)",
                borderRadius: 16,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "var(--shadow-soft)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>
                {TRANSPORT_ICONS[seg.transportType]}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--ink)",
                  }}
                >
                  {seg.fromName} → {seg.toName}
                </div>
                {seg.notes && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      marginTop: 2,
                    }}
                  >
                    {seg.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

