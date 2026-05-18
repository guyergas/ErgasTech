"use client";

import Link from "next/link";
import { family, familyList, photos, posts as allPosts, type TripPost, type FamilyMember } from "./data";

// ─── Avatar ───────────────────────────────────────────────────
interface AvatarProps {
  memberId: string;
  size?: number;
  ring?: boolean;
  glow?: boolean;
}

export function Avatar({ memberId, size = 36, ring = false, glow = false }: AvatarProps) {
  const m = family[memberId] || family.dad;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: m.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        flexShrink: 0,
        boxShadow: ring
          ? `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${m.color}`
          : "none",
        filter: glow ? `drop-shadow(0 4px 12px ${m.color}88)` : "none",
      }}
    >
      <span style={{ filter: "saturate(1.1)" }}>{m.glyph}</span>
    </div>
  );
}

// ─── Photo Placeholder ────────────────────────────────────────
interface PhotoPlaceholderProps {
  id: string;
  height?: number | string;
  rounded?: number;
  label?: boolean;
  style?: React.CSSProperties;
}

export function PhotoPlaceholder({
  id,
  height = 240,
  rounded = 22,
  label = false,
  style = {},
}: PhotoPlaceholderProps) {
  const p = photos[id] || photos.watArun;
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: rounded,
        overflow: "hidden",
        position: "relative",
        background: p.grad,
        ...style,
      }}
    >
      {/* film grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)",
          mixBlendMode: "overlay",
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            color: "rgba(255,255,255,0.86)",
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            background: "rgba(0,0,0,0.28)",
            padding: "3px 8px",
            borderRadius: 10,
            backdropFilter: "blur(4px)",
          }}
        >
          {p.label}
        </div>
      )}
    </div>
  );
}

// ─── Voice Pill ───────────────────────────────────────────────
export function VoicePill({
  authorId,
  len,
  place,
}: {
  authorId: string;
  len: number;
  place: string;
}) {
  const m = family[authorId] || family.dad;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: `${m.color}18`,
        borderRadius: 18,
        padding: "12px 14px",
        border: `0.5px solid ${m.color}30`,
      }}
    >
      {/* waveform */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          height: 28,
        }}
      >
        {[6, 10, 16, 22, 18, 14, 10, 16, 20, 14, 8].map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: m.color,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
          הקלטה קולית
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
          {place} · {len} שניות
        </div>
      </div>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: m.color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        ▶
      </button>
    </div>
  );
}

// ─── Tilts per post ───────────────────────────────────────────
const TILTS: Record<string, number> = {
  p1: -2.4, p2: 1.6, p3: -1.2, p4: 2.6, p5: -1.8,
};
function postTilt(id: string): number {
  if (TILTS[id] !== undefined) return TILTS[id];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 50) / 10) - 2.5;
}

// ─── Post Card ────────────────────────────────────────────────
interface PostCardProps {
  post: TripPost;
}

export function PostCard({ post }: PostCardProps) {
  const m = family[post.authorId] || family.dad;
  const isHero = post.layout === "hero";
  const isVoice = post.layout === "voice";
  const tilt = postTilt(post.id);
  const text =
    post.selectedTextVersion === "improved" && post.improvedText
      ? post.improvedText
      : post.rawText;

  return (
    <Link href={`/trip/post/${post.id}`} style={{ display: "block", textDecoration: "none" }}>
      <div
        className="trip-float-in"
        style={{
          position: "relative",
          marginBottom: 28,
          cursor: "pointer",
          transform: `rotate(${tilt * 0.4}deg)`,
          transition: "transform .2s ease",
        }}
      >
        {/* album page */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderRadius: 24,
            padding: "14px 14px 18px",
            boxShadow:
              "0 2px 6px rgba(58,84,117,0.05), 0 16px 40px rgba(58,84,117,0.10), 0 0 0 0.5px rgba(58,84,117,0.08)",
          }}
        >
          {/* photo */}
          {post.photo && (
            post.photo.startsWith("/") ? (
              <img src={post.photo} alt={post.title} style={{ width: "100%", height: isHero ? 260 : 200, objectFit: "cover", borderRadius: 14, display: "block" }} />
            ) : (
              <PhotoPlaceholder id={post.photo} height={isHero ? 260 : 200} rounded={14} label />
            )
          )}

          {/* gallery extras */}
          {post.extras && post.extras.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
              {post.extras.map((ext) => (
                ext.startsWith("/") ? (
                  <img key={ext} src={ext} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, display: "block" }} />
                ) : (
                  <PhotoPlaceholder key={ext} id={ext} height={100} rounded={10} />
                )
              ))}
            </div>
          )}

          {/* voice pill */}
          {isVoice && post.voiceLen && (
            <div style={{ marginTop: 10 }}>
              <VoicePill
                authorId={post.authorId}
                len={post.voiceLen}
                place={post.locationName}
              />
            </div>
          )}

          {/* metadata */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginTop: 14,
            }}
          >
            <Avatar memberId={post.authorId} size={32} ring />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* location */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 10, color: "var(--terra)", fontWeight: 600 }}>
                  📍
                </span>
                <span
                  className="trip-mono"
                  style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.5 }}
                >
                  {post.locationName} · {post.city}
                </span>
              </div>
              {/* title */}
              <h3
                className="trip-serif"
                style={{
                  margin: 0,
                  fontSize: isHero ? 22 : 18,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "var(--ink)",
                }}
              >
                {post.title}
              </h3>
              {/* text preview */}
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {text}
              </p>
            </div>
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 10,
              borderTop: "0.5px solid var(--rule)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {m.name} · {post.date}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                ❤️ {post.likes}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                💬 {post.comments}
              </span>
              {post.aiImproved && (
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--jade)",
                    background: "rgba(122,149,168,0.12)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  ✦ AI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* day badge */}
        <div
          className="trip-mono"
          style={{
            position: "absolute",
            top: -10,
            left: 18,
            background: "var(--terra)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          יום {post.day}
        </div>
      </div>
    </Link>
  );
}

// ─── Day Section ─────────────────────────────────────────────
export function DaySection({
  day,
  label,
  first = false,
  children,
}: {
  day: number;
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "6px 22px 14px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 30,
              height: 1,
              background: "var(--terra)",
              opacity: 0.3,
            }}
          />
          <span style={{ color: "var(--gold)", fontSize: 14 }}>✦</span>
          <span
            className="trip-hand"
            style={{
              fontSize: 26,
              color: "var(--ink)",
              lineHeight: 1,
              fontWeight: 500,
              transform: "rotate(-1deg)",
              display: "inline-block",
            }}
          >
            {label}
          </span>
          <span style={{ color: "var(--gold)", fontSize: 14 }}>✦</span>
          <div
            style={{
              width: 30,
              height: 1,
              background: "var(--terra)",
              opacity: 0.3,
            }}
          />
        </div>
        <div
          className="trip-mono"
          style={{
            fontSize: 10,
            color: "var(--ink-3)",
            letterSpacing: 1.5,
          }}
        >
          {first
            ? "PAGE 01 · START OF JOURNEY"
            : `PAGE ${String(47 - day + 1).padStart(2, "0")} · DAY ${day}`}
        </div>
      </div>
      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ─── Family Ring ─────────────────────────────────────────────
export function FamilyRing() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        marginTop: 16,
        overflowX: "auto",
        padding: "4px 0 8px",
        scrollbarWidth: "none",
      }}
    >
      {familyList.map((m: FamilyMember) => (
        <Link
          key={m.id}
          href={`/trip/profile/${m.id}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <Avatar memberId={m.id} size={54} ring />
          <span
            style={{
              fontSize: 11,
              color: "var(--ink-2)",
              fontWeight: 500,
            }}
          >
            {m.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────
export function ReactionBar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (r: string) => void;
}) {
  const reactions = ["❤️", "😂", "😮", "🥹", "🔥"];
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        background: "var(--paper)",
        borderRadius: 100,
        padding: 6,
        boxShadow: "inset 0 0 0 0.5px var(--rule)",
      }}
    >
      {reactions.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r === selected ? "" : r)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 100,
            fontSize: 22,
            background: r === selected ? "#fff" : "transparent",
            border: "none",
            cursor: "pointer",
            boxShadow:
              r === selected ? "0 2px 8px rgba(30,26,20,0.12)" : "none",
            transform: r === selected ? "scale(1.15)" : "scale(1)",
            transition: "all .15s",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ─── Comment ─────────────────────────────────────────────────
export function Comment({
  who,
  name,
  text,
  time,
  external = false,
}: {
  who?: string;
  name?: string;
  text: string;
  time: string;
  external?: boolean;
}) {
  const m = who ? family[who] : null;
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      {m ? (
        <Avatar memberId={who!} size={32} />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#E8DAC4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-2)",
            flexShrink: 0,
          }}
        >
          {(name || "").slice(0, 1)}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{
            background: "var(--paper)",
            borderRadius: 14,
            padding: "8px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>
              {m ? m.name : name}
            </span>
            {external && (
              <span style={{ fontSize: 10, color: "var(--ink-3)" }}>
                · עוקב/ת
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              lineHeight: 1.5,
            }}
          >
            {text}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            marginTop: 4,
            padding: "0 12px",
          }}
        >
          {time} · לייק · השב
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────
export function StatsBar({
  days,
  places,
  posts: postCount,
  kms,
}: {
  days: number;
  places: number;
  posts: number;
  kms: number;
}) {
  const items = [
    { value: days, label: "ימים" },
    { value: places, label: "מקומות" },
    { value: postCount, label: "זיכרונות" },
    { value: `${kms.toLocaleString("he")}`, label: 'ק"מ' },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 8,
        padding: "0 0 16px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: 16,
            padding: "10px 6px",
            textAlign: "center",
            boxShadow: "var(--shadow-soft)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="trip-serif"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--terra-d)",
              lineHeight: 1,
            }}
          >
            {item.value}
          </div>
          <div
            style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
