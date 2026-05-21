"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { stats, familyList, getFamilyUserIdByFamilyId } from "@/trip/data";
import { PostCard, DaySection, StatsBar } from "@/trip/TripComponents";
import type { TripPost } from "@/trip/data";

interface UserData {
  id: number;
  email: string;
  name: string;
  photoUrl?: string;
}

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

function TripHomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterUserId = searchParams?.get("userId") ? parseInt(searchParams.get("userId")!) : null;

  const [posts, setPosts] = useState<TripPost[]>([]);
  const [filterUser, setFilterUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const postsRes = await fetch("/api/trip/posts");
        if (postsRes.ok) {
          const allPosts: TripPost[] = await postsRes.json();
          let filtered = allPosts;
          let user = null;

          if (filterUserId) {
            filtered = allPosts.filter(p => p.authorId === filterUserId);
            const userRes = await fetch(`/api/trip/users/${filterUserId}`);
            if (userRes.ok) {
              user = await userRes.json();
              setEditName(user.name);
            }
          }
          setPosts(filtered);
          setFilterUser(user);
        }

        const authRes = await fetch("/api/trip/auth", { credentials: "include" });
        if (authRes.ok) {
          const data = await authRes.json();
          if (data.isAdmin && data.userId) {
            setIsAdmin(true);
            setAdminUserId(data.userId);
          }
        }
      } catch { /* ignore */ }
    })();
  }, [filterUserId]);

  async function handleSaveProfile() {
    if (!editName.trim() || !filterUserId) return;
    setUploading(true);
    try {
      let newPhotoUrl = filterUser?.photoUrl || "";

      if (editPhotoFile) {
        const formData = new FormData();
        formData.append("file", editPhotoFile);
        formData.append("userId", filterUserId.toString());

        const uploadRes = await fetch("/api/trip/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          newPhotoUrl = uploadData.url;
        }
      }

      const res = await fetch(`/api/trip/users/${filterUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), photoUrl: newPhotoUrl }),
      });

      if (res.ok) {
        setFilterUser(prev => prev ? { ...prev, name: editName.trim(), photoUrl: newPhotoUrl } : null);
        setEditPhotoFile(null);
        setEditing(false);
      }
    } catch { /* ignore */ }
    setUploading(false);
  }

  async function handleLogout() {
    await fetch("/api/trip/auth", { method: "DELETE", credentials: "include" });
    setIsAdmin(false);
    router.push("/trip");
  }

  // Calculate day from date order
  const validDates = posts
    .map(p => {
      const d = new Date(p.date);
      return isNaN(d.getTime()) ? null : d;
    })
    .filter((d): d is Date => d !== null);

  const oldestDate = validDates.length > 0 ? new Date(Math.min(...validDates.map(d => d.getTime()))) : null;

  const postsWithCalculatedDay = posts.map(p => {
    if (!oldestDate) return { ...p, calculatedDay: p.day };
    const pDate = new Date(p.date);
    if (isNaN(pDate.getTime())) return { ...p, calculatedDay: p.day };
    const daysDiff = Math.floor((pDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { ...p, calculatedDay: daysDiff };
  });

  // Group posts by calculated day descending
  const byDay = new Map<number, typeof postsWithCalculatedDay>();
  for (const p of postsWithCalculatedDay) {
    const arr = byDay.get(p.calculatedDay) ?? [];
    arr.push(p);
    byDay.set(p.calculatedDay, arr);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => b - a);

  // Count unique locations
  const locations = new Set<string>();
  posts.forEach(p => {
    if (p.city) {
      locations.add(p.city);
    } else if (p.lat && p.lng) {
      locations.add(`${p.lat.toFixed(2)},${p.lng.toFixed(2)}`);
    }
  });

  // Calculate km
  let kms = 0;
  const sortedPosts = [...postsWithCalculatedDay].sort((a, b) => a.calculatedDay - b.calculatedDay);
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

  // Calculate days based on calendar dates
  let daysDiff = 0;
  if (posts.length > 0) {
    const dates = posts
      .map(p => {
        // Parse ISO date format (YYYY-MM-DD)
        const date = new Date(p.date);
        return isNaN(date.getTime()) ? null : date;
      })
      .filter((d): d is Date => d !== null);

    if (dates.length > 0) {
      const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
      const newest = new Date(Math.max(...dates.map(d => d.getTime())));
      daysDiff = Math.floor((newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const actualStats = {
    days: daysDiff,
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

            {editing ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {filterUser.photoUrl ? (
                        <img src={filterUser.photoUrl} alt={filterUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 24, color: "var(--terra)" }}>
                          {filterUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--rule)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--ink)",
                        background: "var(--paper)",
                        outline: "none",
                        fontFamily: "inherit",
                        marginBottom: 8,
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--rule)",
                        fontSize: 12,
                        color: "var(--ink-3)",
                        background: "var(--paper)",
                        outline: "none",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      background: "var(--terra)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: uploading ? "wait" : "pointer",
                      opacity: uploading ? 0.6 : 1,
                    }}
                  >
                    {uploading ? "שמירה..." : "שמור"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditName(filterUser?.name || "");
                      setEditPhotoFile(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      background: "var(--paper)",
                      color: "var(--ink-3)",
                      fontSize: 13,
                      border: "0.5px solid var(--rule)",
                      cursor: "pointer",
                    }}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
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
                  {isAdmin && adminUserId === filterUserId && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--jade)", fontWeight: 600 }}>
                      ✓ פרופיל שלך
                    </p>
                  )}
                </div>
                {isAdmin && adminUserId === filterUserId && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "var(--paper)",
                      color: "var(--ink)",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "0.5px solid var(--rule)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ✏️ עדכון
                  </button>
                )}
              </div>
            )}

            {isAdmin && adminUserId === filterUserId && !editing && (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: 16,
                  borderRadius: 8,
                  background: "rgba(220,53,69,0.1)",
                  color: "#C0392B",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "0.5px solid rgba(220,53,69,0.2)",
                  cursor: "pointer",
                }}
              >
                יציאה מהחשבון
              </button>
            )}
          </>
        ) : (
          <>
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

export default function TripHome() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>טוען...</div>}>
      <TripHomeContent />
    </Suspense>
  );
}
