import { posts, stats, familyList } from "@/trip/data";
import { PostCard, DaySection, StatsBar } from "@/trip/TripComponents";
import Link from "next/link";

export default function TripHome() {
  // Group posts by day
  const day47 = posts.filter((p) => p.day >= 46);
  const day45 = posts.filter((p) => p.day === 45);
  const day42 = posts.filter((p) => p.day === 42);
  const day1 = posts.filter((p) => p.day === 1);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 0 120px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "32px 20px 16px",
          position: "relative",
        }}
      >
        <div
          className="trip-mono"
          style={{
            fontSize: 10,
            color: "var(--terra)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          יום {stats.days} · {stats.kms.toLocaleString("he")} ק״מ
        </div>

        <h1
          className="trip-serif"
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.05,
            fontWeight: 500,
            color: "var(--terra-d)",
          }}
        >
          היומן של
          <br />
          משפחת ארגס
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 22,
              height: 1,
              background: "var(--terra)",
              opacity: 0.4,
            }}
          />
          <span style={{ color: "var(--gold)", fontSize: 14 }}>✦</span>
          <span
            className="trip-hand"
            style={{ fontSize: 18, color: "var(--ink-2)" }}
          >
            תאילנד, 2026–27
          </span>
        </div>

        <StatsBar
          days={stats.days}
          places={stats.places}
          posts={stats.posts}
          kms={stats.kms}
        />

        {/* Family ring */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 4,
            overflowX: "auto",
            padding: "4px 0 8px",
            scrollbarWidth: "none" as const,
          }}
        >
          {familyList.map((m) => (
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
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: m.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  boxShadow: `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${m.color}`,
                }}
              >
                {m.glyph}
              </div>
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
      </div>

      {/* Timeline */}
      {day47.length > 0 && (
        <DaySection day={47} label="היום · בנגקוק">
          {day47.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </DaySection>
      )}

      {day45.length > 0 && (
        <DaySection day={45} label="יום ה׳ · צ׳יאנג מאי">
          {day45.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </DaySection>
      )}

      {day42.length > 0 && (
        <DaySection day={42} label="שני · קראבי">
          {day42.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </DaySection>
      )}

      {day1.length > 0 && (
        <DaySection day={1} label="יום 1 · בנגקוק" first>
          {day1.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </DaySection>
      )}

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", padding: "32px 20px 20px" }}>
        <div
          className="trip-hand"
          style={{
            fontSize: 22,
            color: "var(--ink-3)",
            transform: "rotate(-2deg)",
            display: "inline-block",
          }}
        >
          ✦ המסע ממשיך...
        </div>
      </div>
    </div>
  );
}
