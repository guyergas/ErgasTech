"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { posts, family } from "@/trip/data";
import {
  Avatar,
  PhotoPlaceholder,
  VoicePill,
  ReactionBar,
  Comment,
} from "@/trip/TripComponents";
import Link from "next/link";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const post = posts.find((p) => p.id === params.id) || posts[0];
  const m = family[post.authorId] || family.dad;
  const [reaction, setReaction] = useState<string>("");
  const [showOriginal, setShowOriginal] = useState(false);

  const displayText =
    showOriginal || post.selectedTextVersion === "raw"
      ? post.rawText
      : post.improvedText || post.rawText;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 60,
      }}
    >
      {/* Hero photo */}
      <div style={{ position: "relative" }}>
        {post.photo && (
          <PhotoPlaceholder
            id={post.photo}
            height={380}
            rounded={0}
          />
        )}
        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: 20,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(12px)",
            border: "0.5px solid rgba(255,255,255,0.18)",
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

        {/* bottom info on photo */}
        <div
          style={{
            position: "absolute",
            bottom: 22,
            right: 20,
            left: 20,
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 100,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(8px)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              📍 {post.locationName} · {post.city}
            </span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 100,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(8px)",
                fontSize: 12,
              }}
            >
              יום {post.day}
            </span>
          </div>
          <h1
            className="trip-serif"
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.1,
              fontWeight: 500,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content card */}
      <div
        style={{
          background: "var(--ivory)",
          marginTop: -22,
          position: "relative",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "20px 22px 0",
        }}
      >
        {/* Author row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Avatar memberId={post.authorId} size={48} ring />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {m.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {m.role} · {post.date}
            </div>
          </div>
          <Link
            href={`/trip/profile/${post.authorId}`}
            style={{
              padding: "8px 14px",
              borderRadius: 100,
              background: m.color,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            הפרופיל
          </Link>
        </div>

        {/* Text */}
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "var(--ink)",
            margin: "0 0 18px",
          }}
        >
          {displayText}
        </p>

        {/* Voice pill */}
        {post.layout === "voice" && post.voiceLen && (
          <div style={{ marginBottom: 18 }}>
            <VoicePill
              authorId={post.authorId}
              len={post.voiceLen}
              place={post.locationName}
            />
          </div>
        )}

        {/* AI toggle */}
        {post.aiImproved && post.improvedText && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 100,
              background: showOriginal
                ? "rgba(197,161,78,0.15)"
                : "rgba(122,149,168,0.12)",
              color: showOriginal ? "var(--ochre)" : "var(--jade)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 22,
              border: "none",
              cursor: "pointer",
            }}
          >
            ✦ {showOriginal ? "הצג גרסה משופרת" : "הצג טקסט מקורי"}
          </button>
        )}

        {/* Gallery extras */}
        {post.extras && post.extras.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 22,
            }}
          >
            {post.extras.map((ext) => (
              <PhotoPlaceholder key={ext} id={ext} height={130} rounded={14} label />
            ))}
          </div>
        )}

        {/* Reactions */}
        <div style={{ marginBottom: 22 }}>
          <ReactionBar
            selected={reaction}
            onSelect={(r) => setReaction(r)}
          />
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-3)",
              marginTop: 8,
            }}
          >
            {reaction
              ? `בחרת ${reaction} · תגובות: ${post.likes + 1}`
              : `${post.likes} אנשים הגיבו`}
          </p>
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              תגובות · {post.comments}
            </h3>
          </div>
          <Comment
            who="ofir"
            text="אבא, יש לי תמונה יותר טובה מלמעלה 📸"
            time="לפני 4 שעות"
          />
          <Comment
            who="ayala"
            text='זוכרת איך עידו אמר שזה "הר של מקדש"'
            time="לפני 6 שעות"
          />
          <Comment
            name="סבתא רותי"
            text="כמה אני גאה בכם. מחבקת מרחוק 💛"
            time="לפני יום"
            external
          />
        </div>

        {/* Login prompt */}
        <div
          style={{
            background: "var(--paper)",
            borderRadius: 20,
            padding: "16px 18px",
            textAlign: "center",
            marginBottom: 24,
            border: "0.5px solid var(--rule)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 14,
              color: "var(--ink-2)",
            }}
          >
            כדי להגיב ולעקוב אחרי המסע —
          </p>
          <Link
            href="/trip/login"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: 100,
              background: "var(--terra)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            הירשמו / התחברו
          </Link>
        </div>
      </div>
    </div>
  );
}
