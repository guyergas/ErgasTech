"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { familyList, family, type FamilyMember } from "@/trip/data";
import { Avatar } from "@/trip/TripComponents";
import { LocationPicker } from "@/trip/LocationPicker";
import type { MediaItem, TripPost } from "@/trip/data";

export default function ComposePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/trip/auth", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));

    // Pre-warm Whisper model on page load
    fetch("/api/trip/warmup").catch(() => {});
  }, []);

  if (isAdmin === null) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>טוען...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="trip-hand" style={{ fontSize: 48, marginBottom: 8 }}>✦</div>
        <h1 className="trip-serif" style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>כניסת משפחה</h1>
        <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 24 }}>רק בני משפחה יכולים לפרסם זיכרונות</p>
        <a href={`/trip/login?next=/trip/compose`} style={{ display: "inline-block", padding: "14px 28px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(88,118,160,0.35)" }}>
          כניסה
        </a>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>טוען...</div>}>
      <ComposeForm />
    </Suspense>
  );
}

// ─── Main Compose Form ────────────────────────────────────
function ComposeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams?.get("postId");
  const [author, setAuthor] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [improvedDescription, setImprovedDescription] = useState("");
  const [useImproved, setUseImproved] = useState(false);
  const [improving, setImproving] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [voiceLen, setVoiceLen] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("תאילנד");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [day, setDay] = useState(1);

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the admin user ID on mount
    fetch("/api/trip/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.isAdmin && d.userId) {
          setAuthor(d.userId);
        }
      })
      .catch(() => {});

    // Load post if editing
    if (postId) {
      fetch(`/api/trip/posts/${postId}`)
        .then((r) => r.json())
        .then((post: TripPost) => {
          setAuthor(post.authorId);
          setTitle(post.title);
          setDescription(post.rawText);
          if (post.improvedText) {
            setImprovedDescription(post.improvedText);
            setUseImproved(post.selectedTextVersion === "improved");
          }
          setLocation(post.locationName);
          setCity(post.city);
          setCountry(post.country);
          setDay(post.day);
          setDate(post.date);
          setLat(post.lat);
          setLng(post.lng);
          if (post.mediaItems) {
            setMediaItems(post.mediaItems);
          }
          if (post.audioUrl) {
            setAudioUrl(post.audioUrl);
            setVoiceLen(post.voiceLen || 0);
          }
        })
        .catch(() => {});
    }
  }, [postId]);

  const m = family.guyergas; // Use fixed family member for family context

  // ─── Media Upload ─────────────────────────────────────
  const handleMediaUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/trip/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          const isVideo = file.type.startsWith("video/");
          setMediaItems((prev) => [...prev, { url: data.url, type: isVideo ? "video" : "photo" }]);
        }
      } catch (e) {
        setError(`Upload failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    setUploading(false);
  };

  // ─── Location Selection ──────────────────────────────────
  const handleLocationSelect = (locationStr: string, locLat: number, locLng: number) => {
    setLocation(locationStr);
    setLat(locLat);
    setLng(locLng);

    // Parse city and country from location string (format: "site, city, country")
    const parts = locationStr.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const parsedCountry = parts[parts.length - 1];
      const parsedCity = parts[parts.length - 2];
      setCity(parsedCity);
      setCountry(parsedCountry);
    }
  };

  // ─── Audio Recording ──────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    setRecordingSeconds(0);
  };

  const recordAudio = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    try {
      setRecordingSeconds(0);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Find supported mime type
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "";
      }

      const mr = new MediaRecorder(stream, { mimeType: mimeType || undefined });
      const chunks: Blob[] = [];
      let seconds = 0;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        if (chunks.length === 0) {
          setError("No audio recorded");
          return;
        }

        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });

        // Show upload status
        setUploadingAudio(true);
        setError(`Uploading audio (${(blob.size / 1024).toFixed(1)} KB)...`);

        const fd = new FormData();
        fd.append("file", blob, `voice-${Date.now()}.webm`);

        try {
          const res = await fetch("/api/trip/upload", { method: "POST", body: fd });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `Upload failed: ${res.status}`);
          }

          const data = await res.json();
          if (data.url) {
            setAudioUrl(data.url);
            setVoiceLen(seconds);
            setError(null);
          } else {
            throw new Error("No URL in response");
          }
        } catch (e) {
          setError(`Audio upload failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        setUploadingAudio(false);
      };

      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);

      // Timer that updates UI
      let timerSeconds = 0;
      const timer = setInterval(() => {
        timerSeconds++;
        seconds = timerSeconds;
        setRecordingSeconds(timerSeconds);

        if (timerSeconds >= 120) {
          // Auto-stop after 2 minutes
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);

      timerRef.current = timer;
    } catch (e) {
      setError(`Microphone error: ${e instanceof Error ? e.message : String(e)}`);
      setRecording(false);
    }
  };

  // ─── Improve Description ──────────────────────────────
  const improveText = async () => {
    if (!description.trim()) return;
    setImproving(true);

    try {
      const res = await fetch("/api/trip/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: description,
          authorName: m.name,
          authorRole: m.role,
        }),
      });
      const data = await res.json();
      if (data.improvedText) {
        setImprovedDescription(data.improvedText);
        setUseImproved(true);
      } else {
        setError("LLM improvement failed");
      }
    } catch (e) {
      setError(`Improvement failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    setImproving(false);
  };

  // ─── Transcribe Audio File ───────────────────────────────
  const transcribeAudio = async () => {
    if (!audioUrl) return;

    setTranscribing(true);
    setError("🎤 Transcribing audio... please wait");

    try {
      // Ensure audioUrl is absolute
      const absoluteUrl = audioUrl.startsWith("http") ? audioUrl : `${typeof window !== "undefined" ? window.location.origin : ""}${audioUrl}`;

      const res = await fetch("/api/trip/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: absoluteUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`❌ ${data.error || "Transcription failed"}`);
        setTranscribing(false);
        return;
      }

      if (data.transcript) {
        setDescription(data.transcript);
        setError(null);
      } else {
        setError("❌ No speech detected. Try recording again.");
      }
    } catch (e) {
      console.error("Transcribe error:", e);
      setError(`❌ Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setTranscribing(false);
  };

  // ─── Publish ──────────────────────────────────────────
  const handlePublish = async () => {
    if (!description.trim() && mediaItems.length === 0 && !audioUrl) {
      setError("Add at least some content");
      return;
    }

    setPublishing(true);
    try {
      const hasMedia = mediaItems.length > 0;
      const hasAudio = !!audioUrl;
      const hasVideo = hasMedia && mediaItems.some((m) => m.type === "video");

      const post: any = {
        title: title || "ללא כותרת",
        authorId: typeof author === "string" ? parseInt(author) : author,
        rawText: description,
        improvedText: useImproved ? improvedDescription : undefined,
        selectedTextVersion: useImproved ? "improved" : "raw",
        locationName: location,
        city: city,
        country: country,
        day: day,
        date: date,
        lat: lat ? (typeof lat === "string" ? parseFloat(lat) : lat) : undefined,
        lng: lng ? (typeof lng === "string" ? parseFloat(lng) : lng) : undefined,
        locationPrecision: lat !== undefined ? "exact" : "general",
        mediaItems: hasMedia ? mediaItems : undefined,
        photo: hasMedia ? mediaItems[0].url : undefined,
        extras: hasMedia && mediaItems.length > 1 ? mediaItems.slice(1).map((m) => m.url) : undefined,
        audioUrl: hasAudio ? audioUrl : undefined,
        voiceLen: hasAudio ? voiceLen : undefined,
        aiImproved: useImproved,
      };

      // Only set these for new posts
      if (!postId) {
        post.postType = hasVideo ? "video" : hasMedia ? "photo" : hasAudio ? "voice" : "text";
        post.layout = hasMedia ? "gallery" : hasAudio ? "voice" : "standard";
      }

      console.log("[COMPOSE] Publishing post:", { postId, method: postId ? "PUT" : "POST", post });

      const endpoint = postId ? `/api/trip/posts/${postId}` : "/api/trip/posts";
      const method = postId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });

      if (res.ok) {
        const saved = await res.json();
        const action = postId ? "✅ זיכרון עודכן!" : "✅ זיכרון פורסם!";
        alert(action);
        router.push(`/trip/post/${saved.id || postId}`);
      } else {
        const text = await res.text();
        console.log("[COMPOSE] Error response:", { status: res.status, text });
        try {
          const err = JSON.parse(text);
          setError(`Publish failed: ${err.error}`);
        } catch {
          setError(`Publish failed: ${res.status} ${text}`);
        }
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.log("[COMPOSE] Catch error:", errorMsg);
      setError(`Publish error: ${errorMsg}`);
    }
    setPublishing(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      {/* Error display */}
      {error && (
        <div style={{ background: "rgba(220,60,60,0.15)", border: "1px solid #c00", borderRadius: 12, padding: 12, margin: "20px 16px", color: "#c00" }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 8, cursor: "pointer", color: "#c00", background: "none", border: "none" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "28px 20px 16px" }}>
        <h1 className="trip-serif" style={{ margin: 0, fontSize: 32, fontWeight: 500, color: "var(--terra-d)" }}>
          ✦ {postId ? "עדכון זיכרון" : "זיכרון חדש"}
        </h1>
      </div>

      {/* Title */}
      <Section>
        <SectionLabel>כותרת</SectionLabel>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת הזיכרון (אופציונלי)"
          style={{ ...inputStyle, width: "100%" }}
        />
      </Section>

      {/* Author selection */}
      <Section>
        <SectionLabel>מי כותב?</SectionLabel>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "4px 0 8px", scrollbarWidth: "none" as const }}>
          {familyList.map((member) => {
            // Map family member to user ID (guyergas=1, mom=2, ofir=3, ayala=4, omer=5, ido=6)
            const userIdMap: Record<string, number> = { guyergas: 1, mom: 2, ofir: 3, ayala: 4, omer: 5, ido: 6 };
            const userId = userIdMap[member.id] || 0;

            return (
              <button
                key={member.id}
                onClick={() => setAuthor(userId)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  textDecoration: "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: author === userId ? 1 : 0.5,
                  transition: "opacity .2s",
                  padding: 0,
                }}
              >
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: member.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  boxShadow: author === userId ? `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${member.color}` : `0 0 0 2.5px var(--paper, #FAF6EC), 0 0 0 4.5px ${member.color}66`,
                }}>
                  {member.glyph}
                </div>
                <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{member.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Description */}
      <Section>
        <SectionLabel>תיאור</SectionLabel>
        <textarea
          value={useImproved ? improvedDescription : description}
          onChange={(e) => (useImproved ? setImprovedDescription(e.target.value) : setDescription(e.target.value))}
          placeholder="מה קרה? איך הרגשתם?"
          rows={5}
          style={{ ...inputStyle, width: "100%", resize: "none", boxSizing: "border-box" }}
        />
        {description.trim().length > 20 && (
          <button
            onClick={improveText}
            disabled={improving}
            style={{ marginTop: 8, padding: "7px 14px", borderRadius: 100, background: "rgba(122,149,168,0.12)", color: "var(--jade)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            {improving ? "⏳ שיפור..." : "✦ שפרו עם AI"}
          </button>
        )}
        {improvedDescription && (
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <button onClick={() => setUseImproved(false)} style={{ ...buttonStyle, background: useImproved ? "var(--ivory)" : "var(--terra)", color: useImproved ? "var(--ink)" : "#fff" }}>
              מקורי
            </button>
            <button onClick={() => setUseImproved(true)} style={{ ...buttonStyle, background: useImproved ? "var(--terra)" : "var(--ivory)", color: useImproved ? "#fff" : "var(--ink)" }}>
              ✦ משופר
            </button>
          </div>
        )}
      </Section>

      {/* Media upload */}
      <Section>
        <SectionLabel>תמונות / סרטונים</SectionLabel>
        <button onClick={() => mediaInputRef.current?.click()} style={{ width: "100%", height: 100, borderRadius: 16, border: "2px dashed var(--rule)", background: "var(--ivory)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6 }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{uploading ? "מעלה..." : "הוסיפו תמונות או סרטונים"}</span>
        </button>
        <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple onChange={(e) => handleMediaUpload(e.target.files)} style={{ display: "none" }} />
        {mediaItems.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {mediaItems.map((item, i) => (
              <div key={i} style={{ position: "relative", height: 100, borderRadius: 12, overflow: "hidden", background: "var(--rule)" }}>
                {item.type === "video" ? <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <button onClick={() => setMediaItems((p) => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, border: "none", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Audio */}
      <Section>
        <SectionLabel>הקלטה קולית</SectionLabel>

        {/* Record Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => recording ? stopRecording() : recordAudio()}
            disabled={uploadingAudio}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: recording ? "rgba(220,60,60,0.9)" : `${m.color}cc`,
              color: "#fff",
              border: "none",
              cursor: uploadingAudio ? "default" : "pointer",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: uploadingAudio ? 0.5 : 1
            }}>
            {recording ? "⏹️" : "🎙️"}
          </button>
          {recording && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--terra)" }}>
              {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
            </div>
          )}
          {uploadingAudio && <div style={{ fontSize: 14, color: "var(--ink-3)" }}>⏳ Uploading...</div>}
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div style={{ marginTop: 12, background: `${m.color}18`, borderRadius: 12, padding: "12px 14px", border: `0.5px solid ${m.color}30` }}>
            <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={transcribeAudio}
                disabled={transcribing}
                style={{
                  ...buttonStyle,
                  background: "var(--terra)",
                  color: "#fff",
                  flex: 1,
                  opacity: transcribing ? 0.6 : 1,
                }}
              >
                {transcribing ? "⏳ תמלול..." : "✦ תמלל"}
              </button>
              <button
                onClick={() => setAudioUrl("")}
                style={{ ...buttonStyle, background: "var(--ivory)", color: "var(--ink)" }}
              >
                הסר
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Location */}
      <Section>
        <SectionLabel>מיקום</SectionLabel>
        <button onClick={() => setLocationPickerOpen(true)} style={{ ...buttonStyle, background: lat ? "rgba(90,160,90,0.15)" : "var(--ivory)", color: lat ? "var(--jade)" : "var(--ink-2)", marginBottom: 10, width: "100%" }}>
          {lat ? "✓ GPS נלכד" : "📍 בחרו מיקום"}
        </button>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="אתר, עיר, מדינה" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
      </Section>

      {/* Date */}
      <Section>
        <SectionLabel>תאריך</SectionLabel>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        />
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
          תאריך זה יוצג בזיכרון
        </div>
      </Section>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={locationPickerOpen}
        onSelect={handleLocationSelect}
        onClose={() => setLocationPickerOpen(false)}
      />

      {/* Publish */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <button onClick={handlePublish} disabled={publishing || (!description.trim() && mediaItems.length === 0 && !audioUrl)} style={{ width: "100%", padding: "16px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", opacity: publishing ? 0.5 : 1 }}>
          {publishing ? (postId ? "מעדכן..." : "מפרסם...") : (postId ? "עדכן זיכרון ✦" : "פרסם זיכרון ✦")}
        </button>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "0 16px", marginBottom: 12 }}><div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-soft)" }}>{children}</div></div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--terra)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "0.5px solid var(--rule)",
  fontSize: 13,
  color: "var(--ink)",
  background: "var(--ivory)",
  outline: "none",
  fontFamily: "inherit",
} as const;

const buttonStyle = {
  padding: "8px 14px",
  borderRadius: 100,
  fontSize: 12,
  fontWeight: 600,
  border: "0.5px solid var(--rule)",
  cursor: "pointer",
  transition: "all .15s",
} as const;
