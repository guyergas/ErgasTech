"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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

        const res = await fetch("/api/trip/auth");
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
          setPosts(allPosts.filter(p => p.authorId === userId));
        }
      } catch { /* ignore */ }
    })();
  }, [userId]);

  async function handleLogout() {
    await fetch("/api/trip/auth", { method: "DELETE" });
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

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 80, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px", borderBottom: "0.5px solid var(--rule)" }}>
        <Link
          href="/trip"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 20 }}
        >
          ← חזרה
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 4 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {photoUrl ? (
              <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontWeight: 700, fontSize: 24, color: "var(--terra)" }}>
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <h1 className="trip-serif" style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)", lineHeight: 1.2 }}>
              {username}
            </h1>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--ink-3)", letterSpacing: 0.5 }}>
              {posts.length} זיכרונות
            </p>
            {isAdmin && adminUserId === userId && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--jade)", fontWeight: 600 }}>
                ✓ פרופיל שלך
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit mode */}
      {isAdmin && adminUserId === userId && editing && (
        <div style={{ padding: "24px 20px", background: "var(--cream)", borderBottom: "0.5px solid var(--rule)" }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            שם
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--rule)",
              fontSize: 16,
              color: "var(--ink)",
              background: "#fff",
              outline: "none",
              fontFamily: "inherit",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            תמונה
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--rule)",
              fontSize: 14,
              color: "var(--ink-3)",
              background: "#fff",
              outline: "none",
              fontFamily: "inherit",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={uploading}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 100,
                background: "var(--terra)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: uploading ? "wait" : "pointer",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "שמירה..." : "שמור"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditName(username);
                setEditPhotoFile(null);
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 100,
                background: "var(--paper)",
                color: "var(--ink-3)",
                fontSize: 15,
                fontWeight: 700,
                border: "0.5px solid var(--rule)",
                cursor: "pointer",
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isAdmin && adminUserId === userId && !editing && (
        <div style={{ padding: "16px 20px", display: "flex", gap: 10 }}>
          <button
            onClick={() => setEditing(true)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 100,
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 15,
              fontWeight: 700,
              border: "0.5px solid var(--rule)",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            ✏️ עדכון פרופיל
          </button>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 100,
              background: "rgba(220,53,69,0.08)",
              color: "#C0392B",
              fontSize: 15,
              fontWeight: 700,
              border: "0.5px solid rgba(220,53,69,0.2)",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            יציאה
          </button>
        </div>
      )}

      {/* Posts section */}
      {posts.length > 0 && (
        <div style={{ padding: "24px 20px" }}>
          <h2 className="trip-serif" style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>
            זיכרונות
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/trip/post/${post.id}`}
                style={{
                  display: "block",
                  padding: "16px",
                  background: "var(--ivory)",
                  borderRadius: 16,
                  border: "0.5px solid var(--rule)",
                  textDecoration: "none",
                  transition: "all .2s",
                  boxShadow: "var(--shadow-soft)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--paper)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--ivory)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-soft)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 6, lineHeight: 1.3 }}>
                      {post.title || "זיכרון ללא כותרת"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8, lineHeight: 1.5 }}>
                      {post.rawText.slice(0, 90)}{post.rawText.length > 90 ? "..." : ""}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-3)" }}>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>יום {post.day}</span>
                    </div>
                  </div>
                  {post.photo && (
                    <div style={{ width: 60, height: 60, borderRadius: 8, background: "var(--rule)", flexShrink: 0, overflow: "hidden" }} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--ink-3)" }}>
            {isAdmin && adminUserId === userId ? "עדיין אין זיכרונות" : "אין זיכרונות פומביים"}
          </p>
        </div>
      )}
    </div>
  );
}
