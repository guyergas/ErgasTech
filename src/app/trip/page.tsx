import { stats, familyList, getFamilyUserIdByFamilyId, getFamilyIdByUserId } from "@/trip/data";
import { getPosts, getUser } from "@/trip/store";
import { PostCard, DaySection, StatsBar } from "@/trip/TripComponents";
import type { TripPost } from "@/trip/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function TripHome(props: { searchParams?: Promise<{ userId?: string }> }) {
  const searchParams = await props.searchParams;
  const filterUserId = searchParams?.userId ? parseInt(searchParams.userId) : null;

  const allPosts = getPosts();
  let posts = allPosts;
  let filterUser = null;

  if (filterUserId) {
    posts = allPosts.filter(p => p.authorId === filterUserId);
    filterUser = getUser(filterUserId);
  }

  // Group by day descending
  const byDay = new Map<number, TripPost[]>();
  for (const p of posts) {
    const arr = byDay.get(p.day) ?? [];
    arr.push(p);
    byDay.set(p.day, arr);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => b - a);

  // Count unique locations by city or lat/lng
  const locations = new Set<string>();
  posts.forEach(p => {
    if (p.city) {
      locations.add(p.city);
    } else if (p.lat && p.lng) {
      locations.add(`${p.lat.toFixed(2)},${p.lng.toFixed(2)}`);
    }
  });

  // Calculate km from post locations
  let kms = 0;
  const sortedPosts = [...posts].sort((a, b) => a.day - b.day);
  for (let i = 0; i < sortedPosts.length - 1; i++) {
    const curr = sortedPosts[i];
    const next = sortedPosts[i + 1];
    if (curr.lat && curr.lng && next.lat && next.lng) {
      const currLoc = curr.city || `${curr.lat.toFixed(2)},${curr.lng.toFixed(2)}`;
      const nextLoc = next.city || `${next.lat.toFixed(2)},${next.lng.toFixed(2)}`;
      if (currLoc !== nextLoc) {
        kms += haversineDistance(curr.lat, curr.lng, next.lat, next.lng);
      }
    }
  }

  // Recalculate stats from real posts
  const actualStats = {
    days: posts.length ? (Math.max(...posts.map((p) => p.day)) - Math.min(...posts.map((p) => p.day)) + 1) : 0,
    places: locations.size || stats.places,
    posts: posts.length || stats.posts,
    kms: Math.round(kms),
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 120px" }}>
      {/* Header */}
      <div style={{ padding: "32px 20px 16px", position: "relative" }}>
        {filterUser ? (
          <>
            <Link href="/trip" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 16 }}>
              ← חזרה
            </Link>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {filterUser.photoUrl ? (
                  <img src={filterUser.photoUrl} alt={filterUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 24, color: "var(--terra)" }}>
                    {filterUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h1 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>
                  {filterUser.name}
                </h1>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)" }}>
                  {posts.length} זיכרונות
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {actualStats.days > 0 && (
              <div
                className="trip-mono"
                style={{ fontSize: 10, color: "var(--terra)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}
              >
                יום {actualStats.days} · {actualStats.kms.toLocaleString("he")} ק״מ
              </div>
            )}
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
          </>
        )}

        {/* Family ring */}
        <div style={{ display: "flex", gap: 16, marginTop: 4, overflowX: "auto", padding: "4px 0 8px", scrollbarWidth: "none" as const }}>
          <Link href="/trip" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, textDecoration: "none", opacity: filterUserId ? 0.5 : 1, transition: "opacity .2s" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--terra)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px var(--terra)` }}>
              ✦
            </div>
            <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>הכל</span>
          </Link>
          {familyList.map((m) => (
            <Link key={m.id} href={`/trip?userId=${getFamilyUserIdByFamilyId(m.id)}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, textDecoration: "none", opacity: filterUserId === getFamilyUserIdByFamilyId(m.id) ? 1 : 0.5, transition: "opacity .2s" }}
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
