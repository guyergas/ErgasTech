"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { familyList, family } from "@/trip/data";
import { Avatar } from "@/trip/TripComponents";

type CaptureType = "voice" | "text" | "photo" | null;
type Step = "capture" | "edit" | "done";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/trip/auth").then((r) => r.json()).then((d) => setIsAdmin(d.isAdmin));
  }, []);

  if (isAdmin === null) return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>טוען...</div>;
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="trip-hand" style={{ fontSize: 48, marginBottom: 8 }}>✦</div>
        <h1 className="trip-serif" style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>כניסת משפחה</h1>
        <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 24 }}>רק בני משפחה יכולים לפרסם זיכרונות</p>
        <a href={`/trip/login?next=/trip/admin`} style={{ display: "inline-block", padding: "14px 28px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(88,118,160,0.35)" }}>
          כניסה
        </a>
      </div>
    );
  }
  return <CaptureFlow onPublished={(id) => router.push(`/trip/post/${id}`)} />;
}

// ─── Capture flow ─────────────────────────────────────────────

function CaptureFlow({ onPublished }: { onPublished: (id: string) => void }) {
  const [captureType, setCaptureType] = useState<CaptureType>(null);
  const [step, setStep] = useState<Step>("capture");
  const [authorId, setAuthorId] = useState("dad");

  // Form state
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [showImproved, setShowImproved] = useState(false);
  const [improving, setImproving] = useState(false);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [day, setDay] = useState("1");
  const [photoUrl, setPhotoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceLen, setVoiceLen] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const m = family[authorId] || family.dad;

  async function handleImprove() {
    if (!rawText.trim()) return;
    setImproving(true);
    try {
      const res = await fetch("/api/trip/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, authorName: m.name, authorRole: m.role }),
      });
      const data = await res.json();
      if (data.improvedText) {
        setImprovedText(data.improvedText);
        setShowImproved(true);
      }
    } finally {
      setImproving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const post = {
        title,
        authorId,
        postType: audioUrl ? "voice" : photoUrl ? "photo" : "text",
        layout: audioUrl ? "voice" : photoUrl ? "standard" : "standard",
        rawText,
        improvedText: improvedText || undefined,
        selectedTextVersion: showImproved && improvedText ? "improved" : "raw",
        locationName: location,
        city,
        country: "תאילנד",
        day: parseInt(day) || 1,
        date: new Date().toLocaleDateString("he-IL"),
        photo: photoUrl || undefined,
        audioUrl: audioUrl || undefined,
        voiceLen: voiceLen || undefined,
        aiImproved: !!improvedText,
      };
      const res = await fetch("/api/trip/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const saved = await res.json();
      if (res.ok) onPublished(saved.id);
    } finally {
      setPublishing(false);
    }
  }

  // Reset to capture step
  function reset() {
    setCaptureType(null);
    setStep("capture");
    setTitle(""); setRawText(""); setImprovedText(""); setShowImproved(false);
    setLocation(""); setCity(""); setDay("1");
    setPhotoUrl(""); setAudioUrl(""); setVoiceLen(0);
  }

  if (step === "capture") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
        <div style={{ padding: "28px 20px 16px" }}>
          <div className="trip-mono" style={{ fontSize: 10, color: "var(--terra)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>ניהול</div>
          <h1 className="trip-serif" style={{ margin: 0, fontSize: 32, fontWeight: 500, color: "var(--terra-d)" }}>זיכרון חדש</h1>
        </div>

        {/* Who's posting */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "14px 16px", boxShadow: "var(--shadow-soft)" }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>מי כותב/ת:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {familyList.map((mem) => (
                <button key={mem.id} onClick={() => setAuthorId(mem.id)} style={{
                  display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 14,
                  background: authorId === mem.id ? `${mem.color}20` : "transparent",
                  border: `1.5px solid ${authorId === mem.id ? mem.color : "transparent"}`,
                  cursor: "pointer", transition: "all .15s",
                }}>
                  <Avatar memberId={mem.id} size={36} />
                  <span style={{ fontSize: 11, color: authorId === mem.id ? "var(--ink)" : "var(--ink-3)", fontWeight: authorId === mem.id ? 700 : 400 }}>{mem.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Capture options */}
        <div style={{ padding: "0 16px" }}>
          {/* Voice — primary */}
          <button onClick={() => { setCaptureType("voice"); setStep("capture"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(110deg, var(--terra), var(--sky))", color: "#fff", borderRadius: 24, padding: "18px 18px", boxShadow: "0 10px 28px rgba(88,118,160,0.35)", marginBottom: 12, border: "none", cursor: "pointer", textAlign: "right" as const }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎙</div>
            <div style={{ flex: 1 }}>
              <div className="trip-serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>זיכרון קולי</div>
              <div style={{ fontSize: 12, opacity: 0.88, marginTop: 4 }}>הקליטו 20–40 שניות — יתמלל אוטומטית</div>
            </div>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "text" as CaptureType, icon: "✍️", label: "טקסט", sub: "כתבו ברגע" },
              { id: "photo" as CaptureType, icon: "📷", label: "תמונה", sub: "העלו מהמכשיר" },
            ].map((o) => (
              <button key={o.id!} onClick={() => { setCaptureType(o.id); setStep("edit"); }}
                style={{ background: "var(--ivory)", borderRadius: 20, padding: "16px 14px", boxShadow: "var(--shadow-soft)", textAlign: "right" as const, border: "0.5px solid var(--rule)", cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{o.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{o.label}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{o.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice recorder inline */}
        {captureType === "voice" && (
          <div style={{ padding: "16px 16px 0" }}>
            <VoiceRecorder
              authorColor={m.color}
              onDone={(blob, seconds) => {
                setVoiceLen(seconds);
                setCaptureType("voice");
                // Upload audio
                setUploading(true);
                const fd = new FormData();
                fd.append("file", blob, `voice-${Date.now()}.webm`);
                fetch("/api/trip/upload", { method: "POST", body: fd })
                  .then((r) => r.json())
                  .then((data) => { setAudioUrl(data.url ?? ""); setStep("edit"); })
                  .finally(() => setUploading(false));
              }}
            />
            {uploading && <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>מעלה הקלטה...</p>}
          </div>
        )}
      </div>
    );
  }

  // Edit step
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ padding: "28px 20px 16px" }}>
        <button onClick={reset} style={{ fontSize: 13, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginBottom: 8 }}>← חזרה</button>
        <h1 className="trip-serif" style={{ margin: 0, fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>
          {captureType === "voice" ? "✦ נערך מהקלטה" : captureType === "photo" ? "📷 תמונה + טקסט" : "✍️ טקסט"}
        </h1>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "20px", boxShadow: "var(--shadow-card)" }}>

          {/* Audio playback if voice */}
          {audioUrl && (
            <div style={{ marginBottom: 16, background: `${m.color}18`, borderRadius: 14, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>🎙 הקלטה · {voiceLen}s</div>
              <audio controls src={audioUrl} style={{ width: "100%", height: 36 }} />
            </div>
          )}

          {/* Photo upload */}
          {captureType === "photo" && (
            <PhotoUploader photoUrl={photoUrl} onUploaded={setPhotoUrl} />
          )}

          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת הזיכרון..."
            style={{ width: "100%", fontSize: 20, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 600, color: "var(--ink)", background: "transparent", border: "none", borderBottom: "1px solid var(--rule)", padding: "8px 0", marginBottom: 14, outline: "none", boxSizing: "border-box" as const }} />

          {/* Text toggle: raw / improved */}
          {improvedText && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {(["raw", "improved"] as const).map((v) => (
                <button key={v} onClick={() => setShowImproved(v === "improved")}
                  style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: (showImproved ? v === "improved" : v === "raw") ? "var(--terra)" : "var(--ivory)", color: (showImproved ? v === "improved" : v === "raw") ? "#fff" : "var(--ink-3)" }}>
                  {v === "raw" ? "מקורי" : "✦ משופר"}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={showImproved && improvedText ? improvedText : rawText}
            onChange={(e) => { if (showImproved && improvedText) setImprovedText(e.target.value); else setRawText(e.target.value); }}
            placeholder="ספרו מה קרה..."
            rows={6}
            style={{ width: "100%", fontSize: 16, lineHeight: 1.6, color: "var(--ink)", background: "transparent", border: "none", resize: "none" as const, outline: "none", fontFamily: "'Heebo', sans-serif", boxSizing: "border-box" as const }} />

          {/* Improve with Claude */}
          {rawText.trim().length > 10 && (
            <button onClick={handleImprove} disabled={improving}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, background: "rgba(122,149,168,0.12)", color: "var(--jade)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", marginBottom: 14 }}>
              {improving ? "⏳ שיפור..." : "✦ שפרו עם AI"}
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="📍 מיקום (וואט ארון...)"
              style={{ padding: "10px 12px", borderRadius: 12, border: "0.5px solid var(--rule)", fontSize: 13, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit" }} />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="🏙 עיר (בנגקוק...)"
              style={{ padding: "10px 12px", borderRadius: 12, border: "0.5px solid var(--rule)", fontSize: 13, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit" }} />
          </div>
          <input value={day} onChange={(e) => setDay(e.target.value)} placeholder="יום במסע (למשל: 47)" type="number" min="1"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "0.5px solid var(--rule)", fontSize: 13, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 16, boxSizing: "border-box" as const }} />

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={reset} style={{ flex: 1, padding: "12px", borderRadius: 100, background: "var(--ivory)", color: "var(--ink-2)", fontSize: 14, fontWeight: 600, border: "0.5px solid var(--rule)", cursor: "pointer" }}>ביטול</button>
            <button onClick={handlePublish} disabled={publishing || !rawText.trim()}
              style={{ flex: 2, padding: "12px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 6px 16px rgba(88,118,160,0.35)", opacity: publishing || !rawText.trim() ? 0.6 : 1 }}>
              {publishing ? "מפרסם..." : "פרסם זיכרון ✦"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Recorder ───────────────────────────────────────────

function VoiceRecorder({ authorColor, onDone }: { authorColor: string; onDone: (blob: Blob, seconds: number) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setDone(true);
        onDone(blob, seconds);
      };
      mr.start(100);
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => {
        if (s >= 60) { stop(); return s; }
        return s + 1;
      }), 1000);
    } catch {
      alert("לא ניתן לגשת למיקרופון");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  if (done) return null;

  return (
    <div style={{ background: "radial-gradient(ellipse at 50% 30%, #2a1f18 0%, #14100b 100%)", borderRadius: 24, padding: "32px 20px", textAlign: "center", color: "#fff" }}>
      <div style={{
        width: 140, height: 140, borderRadius: "50%", margin: "0 auto 20px",
        background: recording ? `radial-gradient(circle at 30% 30%, #F2C994 0%, ${authorColor} 60%)` : "rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
        animation: recording ? "trip-breathe 4s ease-in-out infinite" : "none",
        boxShadow: recording ? `0 0 40px ${authorColor}66` : "none",
        transition: "all .4s ease",
      }}>🎙</div>

      {recording && (
        <div className="trip-serif" style={{ fontSize: 48, fontWeight: 400, letterSpacing: -1, marginBottom: 8 }}>
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </div>
      )}
      <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 20px" }}>{recording ? "מקליט... דברו בטבעיות" : "לחצו כדי להתחיל"}</p>

      <button onClick={recording ? stop : start}
        style={{ padding: "14px 28px", borderRadius: 100, background: recording ? "rgba(255,100,100,0.8)" : "var(--ochre)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
        {recording ? "⏹ סיים הקלטה" : "⏺ התחל הקלטה"}
      </button>
    </div>
  );
}

// ─── Photo Uploader ───────────────────────────────────────────

function PhotoUploader({ photoUrl, onUploaded }: { photoUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/trip/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {photoUrl ? (
        <div style={{ position: "relative" }}>
          <img src={photoUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 14 }} />
          <button onClick={() => { onUploaded(""); if (inputRef.current) inputRef.current.value = ""; }}
            style={{ position: "absolute", top: 8, left: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 14, border: "none", cursor: "pointer" }}>✕</button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          style={{ width: "100%", height: 120, borderRadius: 14, border: "2px dashed var(--rule)", background: "var(--ivory)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8 }}>
          <span style={{ fontSize: 32 }}>📷</span>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{uploading ? "מעלה..." : "בחרו תמונה"}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}
