"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { familyList, family } from "@/trip/data";
import { Avatar } from "@/trip/TripComponents";
import type { MediaItem } from "@/trip/data";


export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>(["Page loaded"]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebug((prev) => [...prev.slice(-4), msg]);
  };

  useEffect(() => {
    addDebug("Auth check starting...");
    try {
      fetch("/api/trip/auth")
        .then((r) => {
          addDebug("Auth response received");
          return r.json();
        })
        .then((d) => {
          addDebug(`Auth check complete: isAdmin=${d.isAdmin}`);
          setIsAdmin(d.isAdmin);
        })
        .catch((err) => {
          const msg = `Auth check failed: ${err instanceof Error ? err.message : String(err)}`;
          addDebug(msg);
          setIsAdmin(false);
        });
    } catch (err) {
      const msg = `Error in auth check: ${err instanceof Error ? err.message : String(err)}`;
      addDebug(msg);
      setError(msg);
      setIsAdmin(false);
    }
  }, []);

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: 12, padding: 16, marginBottom: 20, width: "100%" }}>
          <div style={{ fontSize: 12, color: "#c00", wordBreak: "break-word" }}>⚠️ שגיאה: {error}</div>
        </div>
        <a href="/trip" style={{ padding: "10px 20px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 14, textDecoration: "none" }}>חזור לדף הבית</a>
      </div>
    );
  }

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

  return (
    <>
      <ErrorBoundary>
        <ComposeMemory onPublished={(id) => router.push(`/trip/post/${id}`)} />
      </ErrorBoundary>

      {/* Debug panel */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, right: 20, maxWidth: 300, zIndex: 9999,
        background: "rgba(30, 30, 30, 0.95)", color: "#0f0", fontSize: 11, fontFamily: "monospace",
        padding: 10, borderRadius: 8, border: "1px solid #0f0",
        maxHeight: 150, overflowY: "auto"
      }}>
        {debug.map((line, i) => (
          <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {line}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Error Boundary ───────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error already captured
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px" }}>
          <div style={{ background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#c00", wordBreak: "break-word" }}>
              ⚠️ שגיאה בטעינת הטופס: {this.state.error?.message}
            </div>
          </div>
          <a href="/trip" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 14, textDecoration: "none" }}>חזור לדף הבית</a>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Unified compose ──────────────────────────────────────────

function ComposeMemory({ onPublished }: { onPublished: (id: string) => void }) {
  const [authorId, setAuthorId] = useState("dad");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [showImproved, setShowImproved] = useState(false);
  const [improving, setImproving] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [city, setCity] = useState("");
  const [day, setDay] = useState("1");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [locating, setLocating] = useState(false);
  const [suggestedLocation, setSuggestedLocation] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlobUrl, setAudioBlobUrl] = useState("");
  const [audioKept, setAudioKept] = useState(false);
  const [voiceLen, setVoiceLen] = useState(0);
  const [recording, setRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const m = family[authorId] || family.dad;

  // ── GPS ──
  async function grabLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=he`,
            { headers: { "User-Agent": "trip-app" } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const place =
            addr.tourism || addr.attraction || addr.amenity ||
            addr.suburb || addr.neighbourhood || addr.village ||
            addr.town || addr.city_district || addr.city ||
            addr.county || addr.state || data.display_name?.split(",")[0] || "";
          if (place) setSuggestedLocation(place);
        } catch { /* ignore — fall back to manual */ }
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  // ── Media upload ──
  async function handleMediaFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    const results: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/trip/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          const isVideo = file.type.startsWith("video/");
          results.push({ url: data.url, type: isVideo ? "video" : "photo" });
        }
      } catch { /* skip failed */ }
    }
    setMediaItems((prev) => [...prev, ...results]);
    setUploadingMedia(false);
  }

  function removeMedia(idx: number) {
    setMediaItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Audio done ──
  const handleAudioDone = useCallback(async (blob: Blob, seconds: number) => {
    setVoiceLen(seconds);
    // Show local blob immediately so player works right away
    const localUrl = URL.createObjectURL(blob);
    setAudioBlobUrl(localUrl);
    setUploadingAudio(true);

    // Determine file extension based on mime type
    let ext = "webm";
    if (blob.type.includes("ogg")) ext = "ogg";
    else if (blob.type.includes("mp4")) ext = "m4a";
    else if (blob.type.includes("mpeg")) ext = "mp3";

    console.log(`📤 Uploading as ${ext}`);
    const fd = new FormData();
    fd.append("file", blob, `voice-${Date.now()}.${ext}`);
    try {
      const res = await fetch("/api/trip/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        console.log(`❌ Upload failed: ${res.status}\n${data.error}`);
        throw new Error(data.error || "העלאה נכשלה");
      }
      const data = await res.json();
      console.log(`✅ Upload successful\nURL: ${data.url}`);
      if (data.url) {
        setAudioUrl(data.url);
      } else {
        throw new Error("לא התקבל URL של ההקלטה מהשרת");
      }
    } catch (err) {
      console.log(`❌ Upload error: ${(err as Error).message}`);
    }
    setUploadingAudio(false);
  }, []);

  // ── Improve ──
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
      if (data.improvedText) { setImprovedText(data.improvedText); setShowImproved(true); }
    } finally { setImproving(false); }
  }

  // ── Publish ──
  async function handlePublish() {
    setPublishing(true);
    try {
      const hasMedia = mediaItems.length > 0;
      const hasAudio = !!audioUrl;
      const postType = hasMedia && mediaItems.some(item => item.type === "video") ? "video"
        : hasMedia ? "photo"
        : hasAudio && audioKept ? "voice"
        : "text";

      const post = {
        title,
        authorId,
        postType,
        layout: hasMedia ? "gallery" : hasAudio && audioKept ? "voice" : "standard",
        rawText,
        improvedText: improvedText || undefined,
        selectedTextVersion: showImproved && improvedText ? "improved" : "raw",
        locationName,
        city,
        country: "תאילנד",
        lat,
        lng,
        locationPrecision: lat !== undefined ? "exact" : "general",
        day: parseInt(day) || 1,
        date: new Date().toLocaleDateString("he-IL"),
        mediaItems: hasMedia ? mediaItems : undefined,
        photo: hasMedia ? mediaItems[0].url : undefined,
        extras: hasMedia && mediaItems.length > 1 ? mediaItems.slice(1).map(item => item.url) : undefined,
        audioUrl: hasAudio && audioKept ? audioUrl : undefined,
        voiceLen: hasAudio && audioKept ? voiceLen : undefined,
        aiImproved: !!improvedText,
      };

      const res = await fetch("/api/trip/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const saved = await res.json();
      if (res.ok) onPublished(saved.id);
    } finally { setPublishing(false); }
  }

  const canPublish = rawText.trim().length > 0 || mediaItems.length > 0;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px" }}>
        <div className="trip-mono" style={{ fontSize: 10, color: "var(--terra)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>זיכרון חדש</div>
        <h1 className="trip-serif" style={{ margin: 0, fontSize: 32, fontWeight: 500, color: "var(--terra-d)" }}>✦ רגע שרוצים לשמור</h1>
      </div>

      {/* Who's posting */}
      <Section>
        <SectionLabel>מי כותב/ת</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {familyList.map((mem) => (
            <button key={mem.id} onClick={() => setAuthorId(mem.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "6px 10px", borderRadius: 14,
              background: authorId === mem.id ? `${mem.color}20` : "transparent",
              border: `1.5px solid ${authorId === mem.id ? mem.color : "transparent"}`,
              cursor: "pointer", transition: "all .15s",
            }}>
              <Avatar memberId={mem.id} size={36} />
              <span style={{ fontSize: 11, color: authorId === mem.id ? "var(--ink)" : "var(--ink-3)", fontWeight: authorId === mem.id ? 700 : 400 }}>{mem.name}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Media upload */}
      <Section>
        <SectionLabel>תמונות / סרטונים</SectionLabel>

        {mediaItems.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
            {mediaItems.map((item, idx) => (
              <div key={idx} style={{ position: "relative", height: 100, borderRadius: 12, overflow: "hidden", background: "var(--rule)" }}>
                {item.type === "video" ? (
                  <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                ) : (
                  <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: 4 }}>
                  <button onClick={() => removeMedia(idx)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                {item.type === "video" && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: "2px 5px", fontSize: 10, color: "#fff" }}>▶</div>
                )}
              </div>
            ))}
            <button onClick={() => mediaInputRef.current?.click()} style={{
              height: 100, borderRadius: 12, border: "2px dashed var(--rule)",
              background: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 22, color: "var(--ink-3)",
            }}>+</button>
          </div>
        )}

        {mediaItems.length === 0 && (
          <button onClick={() => mediaInputRef.current?.click()} style={{
            width: "100%", height: 100, borderRadius: 16, border: "2px dashed var(--rule)",
            background: "var(--ivory)", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", cursor: "pointer", gap: 6,
          }}>
            <span style={{ fontSize: 28 }}>📷</span>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{uploadingMedia ? "מעלה..." : "הוסיפו תמונות או סרטונים"}</span>
          </button>
        )}

        {uploadingMedia && <p style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center", margin: "6px 0 0" }}>מעלה...</p>}

        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleMediaFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </Section>

      {/* Text */}
      <Section>
        <SectionLabel>טקסט</SectionLabel>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת הזיכרון..."
          style={{ width: "100%", fontSize: 18, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 600, color: "var(--ink)", background: "transparent", border: "none", borderBottom: "1px solid var(--rule)", padding: "6px 0", marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

        {improvedText && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
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
          placeholder="מה קרה כאן? איך הרגשתם?"
          rows={5}
          style={{ width: "100%", fontSize: 16, lineHeight: 1.6, color: "var(--ink)", background: "transparent", border: "none", resize: "none", outline: "none", fontFamily: "'Heebo', sans-serif", boxSizing: "border-box" }} />

        {rawText.trim().length > 10 && (
          <button onClick={handleImprove} disabled={improving}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, background: "rgba(122,149,168,0.12)", color: "var(--jade)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", marginTop: 8 }}>
            {improving ? "⏳ שיפור..." : "✦ שפרו עם AI"}
          </button>
        )}
      </Section>

      {/* Audio */}
      <Section>
        <SectionLabel>הקלטה קולית</SectionLabel>
        {audioBlobUrl ? (
          <AudioResult
            audioUrl={audioBlobUrl}
            uploading={uploadingAudio}
            voiceLen={voiceLen}
            audioKept={audioKept}
            authorColor={m.color}
            onKeep={() => setAudioKept(true)}
            onTranscribe={async () => {
              if (!audioUrl) throw new Error("עדיין מעלה את הקלטה...");
              try {
                const res = await fetch("/api/trip/improve", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ rawText: `[תמלל את ההקלטה הבאה]`, authorName: m.name, authorRole: m.role, audioUrl }),
                });
                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.error || "תמלול נכשל");
                }
                if (data.improvedText) {
                  setRawText(data.improvedText);
                  setImprovedText("");
                  setShowImproved(false);
                } else {
                  throw new Error("לא קיבלנו תגובה מהשרת");
                }
              } catch (err) {
                const msg = (err as Error).message || "שגיאה לא ידועה";
                throw new Error(msg);
              }
              setAudioKept(false);
            }}
            onRemove={() => { setAudioUrl(""); setAudioBlobUrl(""); setVoiceLen(0); setAudioKept(false); }}
          />
        ) : (
          <VoiceRecorder
            authorColor={m.color}
            recording={recording}
            setRecording={setRecording}
            onDone={handleAudioDone}
          />
        )}
      </Section>

      {/* Location */}
      <Section>
        <SectionLabel>מיקום</SectionLabel>
        <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="📍 שם המקום (אופציונלי)"
          style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />

        {/* GPS suggestion banner */}
        {suggestedLocation && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(90,160,90,0.1)", border: "0.5px solid rgba(90,160,90,0.3)" }}>
            <span style={{ fontSize: 13, color: "var(--ink-2)", flex: 1 }}>📍 {suggestedLocation}</span>
            <button onClick={() => { setLocationName(suggestedLocation); setSuggestedLocation(""); }} style={{ padding: "5px 12px", borderRadius: 100, background: "var(--jade)", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>אשר</button>
            <button onClick={() => setSuggestedLocation("")} style={{ padding: "5px 10px", borderRadius: 100, background: "transparent", color: "var(--ink-3)", fontSize: 12, border: "0.5px solid var(--rule)", cursor: "pointer" }}>דחה</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={grabLocation} disabled={locating} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100,
            background: lat !== undefined ? "rgba(90,160,90,0.15)" : "var(--ivory)",
            color: lat !== undefined ? "var(--jade)" : "var(--ink-2)",
            border: "0.5px solid var(--rule)", fontSize: 13, cursor: "pointer", fontWeight: 600,
          }}>
            {locating ? "⏳ מאתר..." : lat !== undefined ? "✓ GPS נלכד" : "📡 GPS"}
          </button>
          {lat !== undefined && (
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{lat.toFixed(4)}, {lng?.toFixed(4)}</span>
          )}
        </div>
      </Section>

      {/* Publish */}
      <div style={{ padding: "0 16px" }}>
        <button onClick={handlePublish} disabled={publishing || !canPublish}
          style={{ width: "100%", padding: "16px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: canPublish ? "pointer" : "default", boxShadow: "0 6px 16px rgba(88,118,160,0.35)", opacity: (publishing || !canPublish) ? 0.5 : 1, transition: "opacity .2s" }}>
          {publishing ? "מפרסם..." : "פרסם זיכרון ✦"}
        </button>
      </div>
    </div>
  );
}

// ─── Audio result (after recording) ──────────────────────────

function AudioResult({ audioUrl, uploading, voiceLen, audioKept, authorColor, onKeep, onTranscribe, onRemove }: {
  audioUrl: string;
  uploading: boolean;
  voiceLen: number;
  audioKept: boolean;
  authorColor: string;
  onKeep: () => void;
  onTranscribe: () => void;
  onRemove: () => void;
}) {
  const [asked, setAsked] = useState(false);
  const [transcribeError, setTranscribeError] = useState("");

  useEffect(() => { setAsked(false); setTranscribeError(""); }, [audioUrl]);

  const handleTranscribeClick = async () => {
    try {
      setTranscribeError("");
      await onTranscribe();
      setAsked(true);
    } catch (err) {
      setTranscribeError((err as Error).message || "תמלול נכשל");
    }
  };

  const [audioError, setAudioError] = useState("");

  return (
    <div style={{ background: `${authorColor}18`, borderRadius: 16, padding: "14px 16px", border: `0.5px solid ${authorColor}30` }}>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>🎙 הקלטה · {voiceLen}s {uploading && "· מעלה..."}</div>
      <audio
        controls
        src={audioUrl}
        style={{ width: "100%", height: 36, marginBottom: 12 }}
        onError={(e) => {
          const audio = e.currentTarget as HTMLAudioElement;
          const code = audio.error?.code;
          const messages: Record<number, string> = {
            1: "הקלטה נקטעה",
            2: "שגיאת רשת",
            3: "פורמט קובץ לא תומך",
            4: "לא ניתן לטעון את הקלטה"
          };
          const msg = messages[code || 0] || "שגיאה בהשמעה";
          console.log(`⚠️ Audio Error\nCode: ${code}\n${msg}\nSrc: ${audio.src}`);
          setAudioError(msg);
        }}
        onLoadedMetadata={() => console.log("✅ Audio loaded successfully")}
      />

      {audioError && (
        <div style={{ fontSize: 12, color: "var(--terra)", background: "rgba(220,60,60,0.1)", padding: "8px 10px", borderRadius: 8, marginBottom: 10 }}>
          ⚠️ {audioError}
        </div>
      )}

      {transcribeError && (
        <div style={{ fontSize: 12, color: "var(--terra)", background: "rgba(220,60,60,0.1)", padding: "8px 10px", borderRadius: 8, marginBottom: 10 }}>
          ⚠️ {transcribeError}
        </div>
      )}

      {!asked && !audioKept && (
        <div>
          <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 10px" }}>מה לעשות עם ההקלטה?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleTranscribeClick} disabled={uploading} style={{ flex: 1, padding: "9px 0", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}>
              ✦ תמלל → טקסט
            </button>
            <button onClick={() => { onKeep(); setAsked(true); }} disabled={uploading} style={{ flex: 1, padding: "9px 0", borderRadius: 100, background: "var(--ivory)", color: "var(--ink)", fontSize: 13, fontWeight: 600, border: "0.5px solid var(--rule)", cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}>
              🎙 שמור כקובץ
            </button>
          </div>
        </div>
      )}

      {audioKept && <p style={{ fontSize: 12, color: "var(--jade)", margin: "4px 0 0", fontWeight: 600 }}>✓ ההקלטה תצורף לפוסט</p>}
      {asked && !audioKept && <p style={{ fontSize: 12, color: "var(--jade)", margin: "4px 0 0", fontWeight: 600 }}>✓ תמולל לטקסט</p>}

      <button onClick={onRemove} style={{ fontSize: 11, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>הסר הקלטה</button>
    </div>
  );
}

// ─── Voice Recorder ───────────────────────────────────────────

function VoiceRecorder({ authorColor, recording, setRecording, onDone }: {
  authorColor: string;
  recording: boolean;
  setRecording: (v: boolean) => void;
  onDone: (blob: Blob, seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine best mime type for this browser
      let mimeType = "audio/webm";
      const opus = MediaRecorder.isTypeSupported("audio/webm;codecs=opus");
      const mp4 = MediaRecorder.isTypeSupported("audio/mp4");
      const ogg = MediaRecorder.isTypeSupported("audio/ogg");
      const webm = MediaRecorder.isTypeSupported("audio/webm");

      if (opus) {
        mimeType = "audio/webm;codecs=opus";
      } else if (mp4) {
        mimeType = "audio/mp4";
      } else if (ogg) {
        mimeType = "audio/ogg";
      }

      console.log(`📻 Recording started\nCodec: ${mimeType}\nSupport: opus=${opus} mp4=${mp4} ogg=${ogg} webm=${webm}`);

      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const chunks = chunksRef.current.length;
        const totalSize = chunksRef.current.reduce((a, b) => a + b.size, 0);
        const blob = new Blob(chunksRef.current, { type: mimeType });

        stream.getTracks().forEach((t) => t.stop());

        if (blob.size === 0) {
          console.log("❌ Recording failed!\nBlob is empty\nChunks: " + chunks);
        } else {
          console.log(`✅ Recording done!\nBlob: ${blob.size} bytes\nChunks: ${chunks}\nType: ${blob.type}\nDuration: ${secondsRef.current}s`);
          onDone(blob, secondsRef.current);
        }
        setRecording(false);
        setSeconds(0);
        secondsRef.current = 0;
      };
      mr.start(100);
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      secondsRef.current = 0;
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= 60) stop();
      }, 1000);
    } catch (err) {
      const error = err as Error;
      console.log(`❌ Microphone Error\nName: ${error.name}\nMessage: ${error.message}`);
    }
  }

  function stop() {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={recording ? stop : start} style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        background: recording ? "rgba(220,60,60,0.9)" : `${authorColor}cc`,
        border: "none", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: recording ? "0 0 0 4px rgba(220,60,60,0.2)" : "none",
        animation: recording ? "trip-breathe 1.5s ease-in-out infinite" : "none",
        transition: "all .2s",
      }}>
        {recording ? "⏹" : "🎙"}
      </button>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{recording ? "מקליט..." : "הקלטה קולית"}</div>
        {recording ? (
          <div className="trip-mono" style={{ fontSize: 20, color: "var(--terra)", letterSpacing: 1 }}>
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>לחצו להקליט עד דקה</div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 16px", marginBottom: 12 }}>
      <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-soft)" }}>
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--terra)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px", borderRadius: 12, border: "0.5px solid var(--rule)",
  fontSize: 13, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit",
};
