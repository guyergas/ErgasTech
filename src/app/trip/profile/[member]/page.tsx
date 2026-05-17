"use client";

import { useParams, useRouter } from "next/navigation";
import { family, posts } from "@/trip/data";
import { Avatar, PostCard } from "@/trip/TripComponents";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.member as string;
  const m = family[memberId] || family.ofir;
  const myPosts = posts.filter((p) => p.authorId === memberId);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 60,
      }}
    >
      {/* Colored header */}
      <div
        style={{
          position: "relative",
          height: 260,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          overflow: "hidden",
          background: `linear-gradient(160deg, ${m.color} 0%, ${m.color}cc 60%, ${m.color}88 100%)`,
        }}
      >
        {/* Texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 8px)",
          }}
        />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: 20,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(12px)",
            border: "0.5px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          ›
        </button>

        {/* Profile info */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 22,
            left: 22,
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              marginBottom: 12,
              backdropFilter: "blur(8px)",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            {m.glyph}
          </div>
          <h1
            className="trip-serif"
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {m.name}
          </h1>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {m.role} · במסע מאז יום 1
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          padding: "20px 16px 8px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        {[
          { v: myPosts.length || 12, l: "זיכרונות" },
          { v: myPosts.filter((p) => p.layout === "voice").length || 6, l: "הקלטות" },
          {
            v: myPosts.reduce((sum, p) => sum + p.likes, 0) || 247,
            l: "לייקים",
          },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: "var(--ivory)",
              borderRadius: 18,
              padding: "14px 10px",
              textAlign: "center",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div
              className="trip-serif"
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: m.color,
              }}
            >
              {s.v}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Bio quote */}
      <div style={{ padding: "6px 22px 16px" }}>
        <p
          className="trip-serif"
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.5,
            color: "var(--ink-2)",
            fontStyle: "italic",
            borderRight: `3px solid ${m.color}`,
            paddingRight: 12,
          }}
        >
          {m.bio}
        </p>
      </div>

      {/* Posts */}
      <div style={{ padding: "0 14px" }}>
        <h2
          className="trip-serif"
          style={{
            margin: "0 0 4px 0",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--ink)",
            padding: "0 2px",
          }}
        >
          הזיכרונות של {m.name}
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {myPosts.length > 0 ? (
            myPosts.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--ink-3)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{m.glyph}</div>
              <p style={{ margin: 0 }}>עוד לא תועדו זיכרונות</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
