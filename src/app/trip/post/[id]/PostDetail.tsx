"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TripPost, FamilyMember } from "@/trip/data";
import type { Comment } from "@/trip/store";
import { Avatar, PhotoPlaceholder } from "@/trip/TripComponents";
import { family } from "@/trip/data";

const REACTIONS = ["❤️", "😂", "😮", "🥹", "🔥"];

interface ReactionDetail {
  emoji: string;
  names: string[];
}

interface Props {
  post: TripPost;
  comments: Comment[];
  details: ReactionDetail[];
  member: FamilyMember;
}

export default function PostDetail({ post, comments: initialComments, details: initialDetails, member: m }: Props) {
  const router = useRouter();
  const [showOriginal, setShowOriginal] = useState(false);
  const [details, setDetails] = useState<ReactionDetail[]>(initialDetails);
  const [myReaction, setMyReaction] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [identity, setIdentity] = useState<{ name: string; userId?: number; memberId?: string; isAdmin?: boolean } | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Check if admin is logged in
      try {
        const res = await fetch("/api/trip/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin && data.userId) {
            // Load user data
            const userRes = await fetch(`/api/trip/users/${data.userId}`);
            if (userRes.ok) {
              const user = await userRes.json();
              setIdentity({ name: user.name, userId: user.id, isAdmin: true });
              return;
            }
          }
        }
      } catch { /* ignore */ }

      // Load family member selection from localStorage
      try {
        const memberId = localStorage.getItem("trip_member");
        if (memberId && family[memberId]) {
          const member = family[memberId];
          setIdentity({ name: member.name, memberId });
        }
      } catch { /* ignore */ }
    })();

    // Load reaction details
    fetch(`/api/trip/posts/${post.id}/react`)
      .then((res) => res.json())
      .then((data) => {
        setDetails(data.details ?? []);
        setMyReaction(data.mine ?? "");
      })
      .catch(() => {});
  }, [post.id]);

  const displayText = showOriginal || post.selectedTextVersion === "raw"
    ? post.rawText
    : (post.improvedText || post.rawText);

  const totalReactions = details.reduce((sum, d) => sum + d.names.length, 0);

  async function handleReact(emoji: string) {
    if (!identity) {
      window.location.href = `/trip/login`;
      return;
    }
    const next = emoji === myReaction ? "" : emoji;
    setMyReaction(next);
    try {
      const visitorId = identity.userId ?? identity.memberId ?? "guest";
      const res = await fetch(`/api/trip/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji: next,
          visitorId: visitorId,
          visitorName: identity.name,
        }),
      });
      const data = await res.json();
      setDetails(data.details ?? []);
      setMyReaction(data.mine ?? "");
    } catch {
      setMyReaction(myReaction); // revert
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !identity) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/trip/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: identity.userId ?? 0,
          body: commentBody,
        }),
      });
      const newComment = await res.json();
      if (res.ok) {
        setComments([newComment, ...comments]);
        setCommentBody("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      {/* Hero media */}
      <div style={{ position: "relative" }}>
        {post.mediaItems && post.mediaItems.length > 0 ? (
          post.mediaItems[0].type === "video" ? (
            <video src={post.mediaItems[0].url} controls style={{ width: "100%", height: 380, objectFit: "cover", display: "block", background: "#000" }} />
          ) : (
            <img src={post.mediaItems[0].url} alt={post.title} style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
          )
        ) : post.photo && post.photo.startsWith("/") ? (
          <img src={post.photo} alt={post.title} style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
        ) : post.photo ? (
          <PhotoPlaceholder id={post.photo} height={380} rounded={0} />
        ) : (
          <div style={{ height: 180, background: `linear-gradient(160deg, ${m.color}66, ${m.color}33)` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />

        <button onClick={() => router.back()} style={{
          position: "absolute", top: 20, right: 16, width: 40, height: 40, borderRadius: 14,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)",
          border: "0.5px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>›</button>

        {(post.photo || (post.mediaItems && post.mediaItems.length > 0)) && (
          <div style={{ position: "absolute", bottom: 22, right: 20, left: 20, color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 500 }}>
                📍 {post.locationName} · {post.city}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", fontSize: 12 }}>יום {post.day}</span>
            </div>
            <h1 className="trip-serif" style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 500, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{post.title}</h1>
          </div>
        )}
      </div>

      {/* Content card */}
      <div style={{ background: "var(--ivory)", marginTop: -22, position: "relative", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: "20px 22px 0" }}>
        {!post.photo && (
          <h1 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 600, color: "var(--ink)" }}>{post.title}</h1>
        )}

        {/* Author */}
        <Link href={`/trip/profile/${post.authorId}`} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, textDecoration: "none" }}>
          <Avatar memberId={post.authorId} size={48} ring />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{m.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.role} · {post.date}</div>
          </div>
        </Link>

        {/* Text */}
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 18px" }}>{displayText}</p>

        {/* Audio player */}
        {post.audioUrl && (
          <div style={{ marginBottom: 18, background: `${m.color}18`, borderRadius: 18, padding: "12px 14px", border: `0.5px solid ${m.color}30` }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>🎙 הקלטה קולית · {post.voiceLen}s</div>
            <audio controls src={post.audioUrl} style={{ width: "100%", height: 36, accentColor: m.color }} />
          </div>
        )}

        {/* Media gallery — new unified mediaItems */}
        {post.mediaItems && post.mediaItems.length > 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
            {post.mediaItems.slice(1).map((item, idx) => (
              item.type === "video" ? (
                <video key={idx} src={item.url} controls style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14, background: "#000" }} />
              ) : (
                <img key={idx} src={item.url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14 }} />
              )
            ))}
          </div>
        )}

        {/* Gallery extras (legacy) */}
        {!post.mediaItems && post.extras && post.extras.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
            {post.extras.map((ext) => (
              ext.startsWith("/") ? (
                <img key={ext} src={ext} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14 }} />
              ) : (
                <PhotoPlaceholder key={ext} id={ext} height={130} rounded={14} label />
              )
            ))}
          </div>
        )}

        {/* AI toggle */}
        {post.aiImproved && post.improvedText && (
          <button onClick={() => setShowOriginal(!showOriginal)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 100,
            background: showOriginal ? "rgba(197,161,78,0.15)" : "rgba(122,149,168,0.12)",
            color: showOriginal ? "var(--ochre)" : "var(--jade)",
            fontSize: 12, fontWeight: 600, marginBottom: 22, border: "none", cursor: "pointer",
          }}>
            ✦ {showOriginal ? "הצג גרסה משופרת" : "הצג טקסט מקורי"}
          </button>
        )}

        {/* Reactions */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", background: "var(--paper)", borderRadius: 100, padding: 6, boxShadow: "inset 0 0 0 0.5px var(--rule)" }}>
            {REACTIONS.map((r) => (
              <button key={r} onClick={() => handleReact(r)} style={{
                flex: 1, padding: "8px 0", borderRadius: 100, fontSize: 22, border: "none", cursor: "pointer",
                background: r === myReaction ? "#fff" : "transparent",
                boxShadow: r === myReaction ? "0 2px 8px rgba(30,26,20,0.12)" : "none",
                transform: r === myReaction ? "scale(1.15)" : "scale(1)",
                transition: "all .15s",
              }}>{r}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap", position: "relative" }}>
            {details.map(({ emoji, names }) => (
              <div key={emoji} style={{ position: "relative" }}>
                <button
                  onMouseEnter={() => setTooltipEmoji(emoji)}
                  onMouseLeave={() => setTooltipEmoji(null)}
                  onClick={() => setTooltipEmoji(tooltipEmoji === emoji ? null : emoji)}
                  style={{ fontSize: 13, color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  {emoji} {names.length}
                </button>
                {tooltipEmoji === emoji && (
                  <div style={{
                    position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff",
                    borderRadius: 8, padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap", zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    {names.join(", ")}
                    <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid var(--ink)" }} />
                  </div>
                )}
              </div>
            ))}
            {totalReactions === 0 && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>היו הראשונים להגיב</span>}
          </div>
          {!identity && (
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <Link href={`/trip/profile`} style={{ fontSize: 12, color: "var(--terra)", textDecoration: "underline" }}>
                בחרו משפחה כדי להגיב
              </Link>
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
            תגובות · {comments.length}
          </h3>

          {/* Comment form — requires login */}
          {identity ? (
            <form onSubmit={handleComment} style={{ marginBottom: 18, display: "flex", gap: 8 }}>
              <input value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="כתבו תגובה..." required
                style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--rule)", fontSize: 14, color: "var(--ink)", background: "var(--paper)", outline: "none", fontFamily: "inherit" }} />
              <button type="submit" disabled={submittingComment}
                style={{ padding: "10px 16px", borderRadius: 12, background: "var(--terra)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", flexShrink: 0 }}>
                {submittingComment ? "..." : "שלח"}
              </button>
            </form>
          ) : (
            <div style={{ marginBottom: 18, padding: "16px", background: "var(--paper)", borderRadius: 16, border: "1px solid var(--rule)", textAlign: "center" }}>
              <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--ink-2)" }}>בחרו משפחה כדי להגיב</p>
              <Link href={`/trip/profile`} style={{ display: "inline-block", padding: "10px 20px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                בחר משפחה
              </Link>
            </div>
          )}

          {/* Comment list */}
          {comments.map((c) => {
            const userName = c.authorId > 0 ? `User ${c.authorId}` : "Guest";
            const userInitial = userName.charAt(0).toUpperCase();
            return (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8DAC4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", flexShrink: 0 }}>
                  {userInitial}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "var(--paper)", borderRadius: 14, padding: "8px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{userName}</div>
                    <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{c.body}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, padding: "0 12px" }}>
                    {new Date(c.createdAt).toLocaleDateString("he-IL")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
