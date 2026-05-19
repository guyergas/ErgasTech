"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { route, posts, travelSegments, stats as defaultStats } from "@/trip/data";
import { Avatar } from "@/trip/TripComponents";
import type { JourneyStats } from "@/trip/data";

const TRANSPORT_ICONS: Record<string, string> = {
  flight: "✈️",
  car: "🚗",
  boat: "⛵",
  train: "🚂",
  walk: "🚶",
};

export default function ReplayPage() {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stats, setStats] = useState<JourneyStats>(defaultStats);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/trip/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(defaultStats));
  }, []);

  const activeRoute = route.filter((r) => !r.future);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= activeRoute.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, activeRoute.length]);

  const handlePlay = () => {
    if (currentIdx >= activeRoute.length - 1) {
      setCurrentIdx(0);
    }
    setPlaying(true);
  };

  const currentCity = activeRoute[currentIdx];
  const cityPosts = posts.filter((p) =>
    p.city === (currentCity?.name || "")
  );

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 60,
        minHeight: "100vh",
      }}
    >
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
          ניגון מסע
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
          מסלול תאילנד
        </h1>
        <p
          style={{
            margin: "6px 0 16px",
            fontSize: 14,
            color: "var(--ink-2)",
          }}
        >
          {stats.days} ימים · {stats.kms.toLocaleString("he")} ק״מ · {activeRoute.length} עיר
        </p>
      </div>

      {/* Animated route visual */}
      <div
        style={{
          margin: "0 16px 16px",
          background: "radial-gradient(ellipse at 50% 30%, #2a2218 0%, #14100b 100%)",
          borderRadius: 24,
          padding: "24px 16px",
          position: "relative",
          overflow: "hidden",
          minHeight: 200,
        }}
      >
        {/* Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.5)",
              top: `${Math.sin(i * 137) * 40 + 50}%`,
              left: `${Math.cos(i * 137) * 45 + 50}%`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}

        {/* Route dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          {activeRoute.map((r, i) => {
            const isPast = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isNext = i > currentIdx;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => { setPlaying(false); setCurrentIdx(i); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 4px",
                  }}
                >
                  <div
                    style={{
                      width: isCurrent ? 18 : 12,
                      height: isCurrent ? 18 : 12,
                      borderRadius: "50%",
                      background: isPast
                        ? "var(--ochre)"
                        : isCurrent
                        ? "#fff"
                        : "rgba(255,255,255,0.2)",
                      border: isCurrent ? "2px solid var(--ochre)" : "none",
                      transition: "all .4s ease",
                      boxShadow: isCurrent
                        ? "0 0 20px rgba(197,161,78,0.8)"
                        : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      color: isCurrent
                        ? "#fff"
                        : isPast
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.3)",
                      fontFamily: "'Heebo', sans-serif",
                      whiteSpace: "nowrap",
                      fontWeight: isCurrent ? 700 : 400,
                      transition: "all .4s ease",
                    }}
                  >
                    {r.name}
                  </span>
                </button>
                {i < activeRoute.length - 1 && (
                  <div
                    style={{
                      width: 24,
                      height: 1.5,
                      background: isPast
                        ? "var(--ochre)"
                        : "rgba(255,255,255,0.15)",
                      transition: "background .4s ease",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current city display */}
        {currentCity && (
          <div
            className="trip-float-in"
            key={currentIdx}
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "#fff",
            }}
          >
            <div
              className="trip-serif"
              style={{ fontSize: 36, fontWeight: 500, lineHeight: 1 }}
            >
              {currentCity.name}
            </div>
            <div
              className="trip-mono"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                marginTop: 6,
                letterSpacing: 1,
              }}
            >
              יום {currentCity.day} · {currentCity.posts} זיכרונות
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "0.5px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ‹‹
          </button>
          <button
            onClick={playing ? () => setPlaying(false) : handlePlay}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--ochre)",
              border: "none",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(197,161,78,0.5)",
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={() =>
              setCurrentIdx(Math.min(activeRoute.length - 1, currentIdx + 1))
            }
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "0.5px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ››
          </button>
        </div>
      </div>

      {/* Travel segments */}
      <div style={{ padding: "0 16px 16px" }}>
        <h2
          className="trip-serif"
          style={{
            margin: "0 0 12px",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          קטעי נסיעה
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {travelSegments.map((seg, i) => {
            const isActive =
              activeRoute[currentIdx]?.name === seg.fromName ||
              activeRoute[currentIdx]?.name === seg.toName;
            return (
              <div
                key={seg.id}
                style={{
                  background: isActive
                    ? "rgba(88,118,160,0.1)"
                    : "rgba(255,255,255,0.8)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: isActive ? "var(--shadow-card)" : "var(--shadow-soft)",
                  border: isActive ? "0.5px solid var(--terra)" : "0.5px solid var(--rule)",
                  transition: "all .3s ease",
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
            );
          })}
        </div>
      </div>

      {/* Posts from current city */}
      {currentCity && (
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
            זיכרונות מ{currentCity.name}
          </h2>
          {cityPosts.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--ink-3)" }}>
              {currentCity.future ? "עוד לא הגענו" : "אין זיכרונות זמינים"}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cityPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/trip/post/${p.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: 16,
                    textDecoration: "none",
                    boxShadow: "var(--shadow-soft)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Avatar memberId={p.authorId} size={36} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--ink)",
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}
                    >
                      {p.date} · ❤️ {p.likes}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
