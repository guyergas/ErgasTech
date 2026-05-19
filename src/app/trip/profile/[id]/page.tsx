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

export default function AdminProfilePage() {
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
        // Always load requested user's data
        const userRes = await fetch(`/api/trip/users/${userId}`);
        if (userRes.ok) {
          const userData: UserData = await userRes.json();
          setUser(userData);
          setUsername(userData.name);
          setPhotoUrl(userData.photoUrl || "");
          setEditName(userData.name);
        }

        // Check if current viewer is logged in
        const res = await fetch("/api/trip/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin && data.userId) {
            setIsAdmin(true);
            setAdminUserId(data.userId);
          }
        }

        // Load posts by this user
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
    await fetch("/api/trip/auth", { method: "DELETE" });
    setIsAdmin(false);
    router.push("/trip");
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return;
    setUploading(true);
    try {
      let newPhotoUrl = photoUrl;

      // Upload photo if selected
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

      // Update user data
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
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--ink-3)" }}>משתמש לא נמצא</p>
        <Link href="/trip" style={{ fontSize: 13, color: "var(--terra)", textDecoration: "underline" }}>
          חזור לעמוד הבית
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 60px" }}>
      <Link href="/trip" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 24 }}>
        ← יומן המסע
      </Link>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--rule)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginBottom: 12, overflow: "hidden" }}>
          {photoUrl ? (
            <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontWeight: 600, color: "var(--ink-3)" }}>
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>
          {username}
        </h1>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--ink-3)" }}>{user.email}</p>
        {isAdmin && adminUserId === userId && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--jade)", fontWeight: 600 }}>✓ מחובר</p>
        )}
      </div>

      {isAdmin && adminUserId === userId && (
        <>
          {editing ? (
            <form style={{ background: "var(--ivory)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 8, fontWeight: 600 }}>שינוי שם</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--rule)", fontSize: 14, color: "var(--ink)", background: "#fff", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }}
              />
              <label style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 8, fontWeight: 600 }}>תמונת פרופיל</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--rule)", fontSize: 14, color: "var(--ink)", background: "#fff", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={uploading}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, background: "var(--terra)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.6 : 1 }}
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
                  style={{ flex: 1, padding: "8px", borderRadius: 8, background: "var(--paper)", color: "var(--ink-3)", fontSize: 13, border: "0.5px solid var(--rule)", cursor: "pointer" }}
                >
                  ביטול
                </button>
              </div>
            </form>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--ivory)", color: "var(--ink)", fontSize: 15, fontWeight: 600, border: "0.5px solid var(--rule)", cursor: "pointer" }}
              >
                ✏️ עדכן פרופיל
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{ width: "100%", padding: "14px", borderRadius: 100, background: "rgba(229,85,85,0.1)", color: "#C0392B", fontSize: 15, fontWeight: 600, border: "0.5px solid rgba(229,85,85,0.3)", cursor: "pointer" }}
            >
              יציאה מהחשבון
            </button>
          </div>
        </>
      )}

      {/* User's posts */}
      {posts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 className="trip-serif" style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>
            זיכרונות ({posts.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/trip/post/${post.id}`}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  background: "var(--ivory)",
                  borderRadius: 12,
                  border: "0.5px solid var(--rule)",
                  textDecoration: "none",
                  transition: "all .2s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>
                  {post.title || "זיכרון ללא כותרת"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6 }}>
                  {post.rawText.slice(0, 80)}{post.rawText.length > 80 ? "..." : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {post.date} · יום {post.day}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
