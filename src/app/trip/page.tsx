import { stats, familyList } from "@/trip/data";
import { getPosts } from "@/trip/store";
import { PostCard, DaySection, StatsBar } from "@/trip/TripComponents";
import type { TripPost } from "@/trip/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TripHome() {
  const posts = getPosts();

  // Group by day descending
  const byDay = new Map<number, TripPost[]>();
  for (const p of posts) {
    const arr = byDay.get(p.day) ?? [];
    arr.push(p);
    byDay.set(p.day, arr);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => b - a);

  // Recalculate stats from real posts
  const actualStats = {
    days: posts.length ? Math.max(...posts.map((p) => p.day)) : stats.days,
    places: new Set(posts.map((p) => p.city).filter(Boolean)).size || stats.places,
    posts: posts.length || stats.posts,
    kms: stats.kms,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 120px" }}>
      {/* Header */}
      <div style={{ padding: "32px 20px 16px", position: "relative" }}>
        <div
          className="trip-mono"
          style={{ fontSize: 10, color: "var(--terra)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}
        >
          יום {actualStats.days} · {stats.kms.toLocaleString("he")} ק״מ
        </div>
        <h1
          className="trip-serif"
          style={{ margin: 0, fontSize: 38, lineHeight: 1.05, fontWeight: 500, color: "var(--terra-d)" }}
        >
          היומן של<br />משפחת ארגס
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 20 }}>
          <div style={{ width: 22, height: 1, background: "var(--terra)", opacity: 0.4 }} />
          <span style={{ color: "var(--gold)", fontSize: 14 }}>✦</span>
          <span className="trip-hand" style={{ fontSize: 18, color: "var(--ink-2)" }}>תאילנד, 2026–27</span>
        </div>

        <StatsBar days={actualStats.days} places={actualStats.places} posts={actualStats.posts} kms={actualStats.kms} />

        {/* Family ring */}
        <div style={{ display: "flex", gap: 16, marginTop: 4, overflowX: "auto", padding: "4px 0 8px", scrollbarWidth: "none" as const }}>
          {familyList.map((m) => (
            <Link key={m.id} href={`/trip/profile/${m.id}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, textDecoration: "none" }}
            >
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${m.color}` }}>
                {m.glyph}
              </div>
              <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{m.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Timeline grouped by day */}
      {days.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
          <p className="trip-serif" style={{ fontSize: 22, margin: 0 }}>המסע עוד לא התחיל</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>הוסיפו את הזיכרון הראשון מהאדמין</p>
        </div>
      )}

      {days.map((day, i) => {
        const dayPosts = byDay.get(day)!;
        const firstPost = dayPosts[0];
        const label = `יום ${day} · ${firstPost?.city || ""}`;
        return (
          <DaySection key={day} day={day} label={label} first={i === days.length - 1}>
            {dayPosts.map((p) => <PostCard key={p.id} post={p} />)}
          </DaySection>
        );
      })}

      <div style={{ textAlign: "center", padding: "32px 20px 20px" }}>
        <div className="trip-hand" style={{ fontSize: 22, color: "var(--ink-3)", transform: "rotate(-2deg)", display: "inline-block" }}>
          ✦ המסע ממשיך...
        </div>
      </div>
    </div>
  );
}
