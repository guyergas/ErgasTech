"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { familyList, getFamilyUserIdByFamilyId, getFamilyIdByUserId } from "@/trip/data";
import { PostCard } from "@/trip/TripComponents";
import type { TripPost } from "@/trip/data";

interface UserData {
  id: number;
  email: string;
  name: string;
  photoUrl?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<TripPost[]>([]);
  const familyId = getFamilyIdByUserId(userId);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await fetch(`/api/trip/users/${userId}`);
        if (userRes.ok) {
          const userData: UserData = await userRes.json();
          setUser(userData);
          setUsername(userData.name);
          setPhotoUrl(userData.photoUrl || "");
          setEditName(userData.name);
        }

        const res = await fetch("/api/trip/auth", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin && data.userId) {
            setIsAdmin(true);
            setAdminUserId(data.userId);
          }
        }

        const postsRes = await fetch("/api/trip/posts");
        if (postsRes.ok) {
          const allPosts: TripPost[] = await postsRes.json();
          const userPosts = allPosts.filter(p => p.authorId === userId);
          setPosts(userPosts);
        }
      } catch { /* ignore */ }
    })();
  }, [userId]);

  async function handleLogout() {
    await fetch("/api/trip/auth", { method: "DELETE", credentials: "include" });
    setIsAdmin(false);
    router.push("/trip");
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return;
    setUploading(true);
    try {
      let newPhotoUrl = photoUrl;

      if (editPhotoFile) {
        const formData = new FormData();
        formData.append("file", editPhotoFile);
        formData.append("userId", userId.toString());

        const uploadRes = await fetch("/api/trip/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          newPhotoUrl = uploadData.url;
        }
      }

      const res = await fetch(`/api/trip/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), photoUrl: newPhotoUrl }),
      });

      if (res.ok) {
        setUsername(editName.trim());
        setPhotoUrl(newPhotoUrl);
        setEditPhotoFile(null);
        setEditing(false);
      }
    } catch { /* ignore */ }
    setUploading(false);
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 16, color: "var(--ink-3)", marginBottom: 24 }}>משתמש לא נמצא</p>
        <Link href="/trip" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          חזרה לעמוד הבית
        </Link>
      </div>
    );
  }

  const family = familyList.find(m => m.id === familyId);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 120px" }}>
      {/* Header */}
      <div style={{ padding: "32px 20px 16px", position: "relative" }}>
        <Link href="/trip" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 16 }}>
          ← חזרה
        </Link>

        {editing ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 24, color: "var(--terra)" }}>
                      {username.charAt(0).toUpperCase()}
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
                  setEditName(username);
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
              {photoUrl ? (
                <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontWeight: 700, fontSize: 24, color: "var(--terra)" }}>
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>
                {username}
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)" }}>
                {posts.length} זיכרונות
              </p>
              {isAdmin && adminUserId === userId && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--jade)", fontWeight: 600 }}>
                  ✓ פרופיל שלך
                </p>
              )}
            </div>
            {isAdmin && adminUserId === userId && !editing && (
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

        {isAdmin && adminUserId === userId && !editing && (
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

        {/* Family ring - still available to navigate */}
        <div style={{ display: "flex", gap: 16, marginTop: 4, overflowX: "auto", padding: "4px 0 8px", scrollbarWidth: "none" as const }}>
          {familyList.map((m) => (
            <Link key={m.id} href={`/trip/profile/${getFamilyUserIdByFamilyId(m.id)}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, textDecoration: "none", opacity: m.id === familyId ? 1 : 0.5, transition: "opacity .2s" }}
            >
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${m.color}` }}>
                {m.glyph}
              </div>
              <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{m.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
          <p className="trip-serif" style={{ fontSize: 22, margin: 0 }}>אין זיכרונות עדיין</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            {isAdmin && adminUserId === userId ? "התחילו לשתף את הזיכרונות שלכם" : "למשתמש זה אין זיכרונות פומביים"}
          </p>
        </div>
      ) : (
        <div style={{ padding: "0 0 20px" }}>
          {posts.map((post, idx) => (
            <div key={post.id} style={{ paddingBottom: idx === posts.length - 1 ? 20 : 0 }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", padding: "32px 20px 20px" }}>
        <div className="trip-hand" style={{ fontSize: 22, color: "var(--ink-3)", transform: "rotate(-2deg)", display: "inline-block" }}>
          ✦ המסע ממשיך...
        </div>
      </div>
    </div>
  );
}
