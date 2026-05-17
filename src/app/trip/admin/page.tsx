"use client";

import { useState } from "react";
import { familyList, family } from "@/trip/data";
import { Avatar } from "@/trip/TripComponents";

type CaptureType = "voice" | "text" | "photo" | "video" | "place";

const CAPTURE_OPTIONS: {
  id: CaptureType;
  icon: string;
  label: string;
  sub: string;
  color: string;
  big?: boolean;
}[] = [
  {
    id: "voice",
    icon: "🎙",
    label: "זיכרון קולי",
    sub: "דברו 20–40 שניות",
    color: "var(--terra)",
    big: true,
  },
  { id: "text", icon: "✍️", label: "טקסט", sub: "כתבו ברגע", color: "var(--ochre)" },
  { id: "photo", icon: "📷", label: "תמונה", sub: "מהמצלמה", color: "var(--jade)" },
  {
    id: "video",
    icon: "🎬",
    label: "וידאו קצר",
    sub: "עד 15 שניות",
    color: "var(--sky)",
  },
  {
    id: "place",
    icon: "📍",
    label: "סמן מקום",
    sub: "בלי מילים",
    color: "var(--rose)",
  },
];

export default function AdminPage() {
  const [selectedAuthor, setSelectedAuthor] = useState("dad");
  const [captureType, setCaptureType] = useState<CaptureType | null>(null);
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRecord = () => {
    if (recording) {
      setRecording(false);
      setCaptureType("text"); // show text editor with transcript placeholder
      setTextContent(
        "היום היה היום הכי טוב במסע. עלינו על המקדש עם המדרגות הגדולות..."
      );
    } else {
      setRecording(true);
      setSeconds(0);
      const interval = setInterval(() => {
        setSeconds((s) => {
          if (s >= 40) {
            setRecording(false);
            clearInterval(interval);
            return s;
          }
          return s + 1;
        });
      }, 1000);
    }
  };

  const handleSubmit = () => {
    // TODO: wire to actual API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCaptureType(null);
      setTextContent("");
      setTitle("");
      setLocation("");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 20px" }}>
        <div
          className="trip-mono"
          style={{
            fontSize: 10,
            color: "var(--terra)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          ניהול
        </div>
        <h1
          className="trip-serif"
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 500,
            color: "var(--terra-d)",
          }}
        >
          זיכרון חדש
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-2)" }}>
          תעדו רגע בפחות מ-30 שניות
        </p>
      </div>

      {/* Who's posting */}
      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: 20,
            padding: "14px 16px",
            boxShadow: "var(--shadow-soft)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              marginBottom: 10,
            }}
          >
            מי כותב/ת:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {familyList.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedAuthor(m.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 10px",
                  borderRadius: 14,
                  background:
                    selectedAuthor === m.id
                      ? `${m.color}20`
                      : "transparent",
                  border:
                    selectedAuthor === m.id
                      ? `1.5px solid ${m.color}`
                      : "1.5px solid transparent",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <Avatar memberId={m.id} size={36} />
                <span
                  style={{
                    fontSize: 11,
                    color:
                      selectedAuthor === m.id ? "var(--ink)" : "var(--ink-3)",
                    fontWeight: selectedAuthor === m.id ? 700 : 400,
                  }}
                >
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Capture options */}
      {!captureType && (
        <div style={{ padding: "0 16px" }}>
          {/* Voice — primary big button */}
          <button
            onClick={() => {
              setCaptureType("voice");
              setRecording(false);
              setSeconds(0);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              background:
                "linear-gradient(110deg, var(--terra), var(--sky))",
              color: "#fff",
              borderRadius: 24,
              padding: "18px 18px",
              boxShadow: "0 10px 28px rgba(88,118,160,0.35)",
              marginBottom: 12,
              border: "none",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              🎙
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="trip-serif"
                style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}
              >
                זיכרון קולי
              </div>
              <div style={{ fontSize: 12, opacity: 0.88, marginTop: 4 }}>
                הדרך הכי קלה — דברו וזה ייכתב
              </div>
            </div>
            <span style={{ fontSize: 20 }}>‹</span>
          </button>

          {/* Grid of others */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {CAPTURE_OPTIONS.filter((o) => !o.big).map((o) => (
              <button
                key={o.id}
                onClick={() => setCaptureType(o.id)}
                style={{
                  background: "var(--ivory)",
                  borderRadius: 20,
                  padding: "16px 14px",
                  boxShadow: "var(--shadow-soft)",
                  textAlign: "right",
                  border: "0.5px solid var(--rule)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    marginBottom: 10,
                  }}
                >
                  {o.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                  {o.label}
                </div>
                <div
                  style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}
                >
                  {o.sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice recording UI */}
      {captureType === "voice" && !textContent && (
        <div style={{ padding: "0 16px" }}>
          <div
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, #2a1f18 0%, #14100b 100%)",
              borderRadius: 24,
              padding: "32px 20px",
              textAlign: "center",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Breathing orb */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: recording
                  ? "radial-gradient(circle at 30% 30%, #F2C994 0%, #C96F4E 50%, #6B3F2A 100%)"
                  : "rgba(255,255,255,0.12)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                animation: recording ? "trip-breathe 4s ease-in-out infinite" : "none",
                boxShadow: recording
                  ? "0 0 60px rgba(217,160,84,0.45)"
                  : "none",
                transition: "all .4s ease",
              }}
            >
              🎙
            </div>

            {/* Timer */}
            {recording && (
              <div
                className="trip-serif"
                style={{
                  fontSize: 48,
                  fontWeight: 400,
                  letterSpacing: -1,
                  marginBottom: 8,
                }}
              >
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </div>
            )}

            <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 20px" }}>
              {recording
                ? "מקליט... דברו בטבעיות"
                : "לחצו כדי להתחיל להקליט"}
            </p>

            <button
              onClick={handleRecord}
              style={{
                padding: "14px 28px",
                borderRadius: 100,
                background: recording ? "rgba(255,100,100,0.8)" : "var(--ochre)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}
            >
              {recording ? "⏹ סיים הקלטה" : "⏺ התחל הקלטה"}
            </button>

            <button
              onClick={() => setCaptureType(null)}
              style={{
                display: "block",
                margin: "12px auto 0",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Text / AI edit form */}
      {(captureType === "text" || (captureType === "voice" && textContent)) && (
        <div style={{ padding: "0 16px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: "20px",
              boxShadow: "var(--shadow-card)",
              backdropFilter: "blur(12px)",
            }}
          >
            {captureType === "voice" && textContent && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  padding: "8px 12px",
                  background: "rgba(122,149,168,0.12)",
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 14 }}>✦</span>
                <span style={{ fontSize: 12, color: "var(--jade)", fontWeight: 600 }}>
                  תמלול אוטומטי · AI שיפר בעדינות
                </span>
              </div>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת הזיכרון..."
              style={{
                width: "100%",
                fontSize: 20,
                fontFamily: "'Frank Ruhl Libre', serif",
                fontWeight: 600,
                color: "var(--ink)",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--rule)",
                padding: "8px 0",
                marginBottom: 14,
                outline: "none",
              }}
            />

            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="ספרו מה קרה..."
              rows={6}
              style={{
                width: "100%",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--ink)",
                background: "transparent",
                border: "none",
                resize: "none",
                outline: "none",
                fontFamily: "'Heebo', sans-serif",
              }}
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="📍 מיקום (למשל: וואט ארון, בנגקוק)"
              style={{
                width: "100%",
                fontSize: 13,
                color: "var(--ink-2)",
                background: "rgba(58,84,117,0.04)",
                border: "0.5px solid var(--rule)",
                borderRadius: 12,
                padding: "10px 12px",
                outline: "none",
                marginTop: 12,
                fontFamily: "'Heebo', sans-serif",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 16,
              }}
            >
              <button
                onClick={() => {
                  setCaptureType(null);
                  setTextContent("");
                  setTitle("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 100,
                  background: "var(--ivory)",
                  color: "var(--ink-2)",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "0.5px solid var(--rule)",
                  cursor: "pointer",
                }}
              >
                ביטול
              </button>
              <button
                onClick={handleSubmit}
                disabled={!textContent && !title}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 100,
                  background:
                    submitted ? "var(--jade)" : "var(--terra)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(88,118,160,0.35)",
                  transition: "all .2s",
                }}
              >
                {submitted ? "✓ פורסם!" : "פרסם זיכרון"}
              </button>
            </div>
          </div>

          {/* TODO note */}
          <div
            style={{
              margin: "12px 0",
              padding: "10px 14px",
              background: "rgba(197,161,78,0.1)",
              borderRadius: 12,
              border: "0.5px solid rgba(197,161,78,0.3)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--ochre)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              TODO: חיבור ל-API אמיתי · העלאת מדיה · תמלול קולי אמיתי
            </p>
          </div>
        </div>
      )}

      {/* Photo/Video/Place placeholder */}
      {(captureType === "photo" ||
        captureType === "video" ||
        captureType === "place") && (
        <div style={{ padding: "0 16px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: 20,
              padding: "40px 20px",
              textAlign: "center",
              boxShadow: "var(--shadow-soft)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {captureType === "photo"
                ? "📷"
                : captureType === "video"
                ? "🎬"
                : "📍"}
            </div>
            <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 16px" }}>
              {captureType === "photo" && "העלאת תמונה"}
              {captureType === "video" && "העלאת וידאו (עד 15 שניות)"}
              {captureType === "place" && "סימון מיקום"}
            </p>
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(197,161,78,0.1)",
                borderRadius: 12,
                border: "0.5px solid rgba(197,161,78,0.3)",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "var(--ochre)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                TODO: העלאת קבצים · אופטימיזציה בצד שרת
              </p>
            </div>
            <button
              onClick={() => setCaptureType(null)}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                background: "var(--ivory)",
                color: "var(--ink-2)",
                fontSize: 14,
                fontWeight: 600,
                border: "0.5px solid var(--rule)",
                cursor: "pointer",
              }}
            >
              חזרה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
