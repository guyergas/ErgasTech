"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GuestProfilePage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<{ name: string; email: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trip_guest");
      if (raw) {
        const parsed = JSON.parse(raw);
        setIdentity(parsed);
        setName(parsed.name);
        setEmail(parsed.email);
      }
    } catch { /* ignore */ }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const updated = { name: name.trim(), email: email.trim() };
    localStorage.setItem("trip_guest", JSON.stringify(updated));
    setIdentity(updated);
    setEditing(false);
  }

  function handleLogout() {
    localStorage.removeItem("trip_guest");
    router.push("/trip");
  }

  if (!identity) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 className="trip-serif" style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500, color: "var(--terra-d)" }}>לא מחוברים</h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--ink-2)" }}>יש להתחבר כדי לצפות בפרופיל</p>
        <Link href="/trip/login" style={{ display: "inline-block", padding: "12px 24px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          כניסה
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 60px" }}>
      {/* Back */}
      <Link href="/trip" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 24 }}>
        ← יומן המסע
      </Link>

      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          {identity.name.slice(0, 1)}
        </div>
        <h1 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 500, color: "var(--terra-d)" }}>{identity.name}</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-3)" }}>{identity.email}</p>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--jade, #5A8A6A)", fontWeight: 600 }}>✓ עוקב/ת אחרי המסע</p>
      </div>

      {editing ? (
        <form onSubmit={handleSave} style={{ background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "22px 20px", boxShadow: "var(--shadow-card)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>עריכת פרטים</h2>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלכם" required
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--rule)", fontSize: 15, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="כתובת אימייל" required
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--rule)", fontSize: 15, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 14, boxSizing: "border-box" as const }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
              שמירה
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: "12px", borderRadius: 100, background: "var(--ivory)", color: "var(--ink-2)", fontSize: 15, fontWeight: 600, border: "0.5px solid var(--rule)", cursor: "pointer" }}>
              ביטול
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setEditing(true)} style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--ivory)", color: "var(--ink)", fontSize: 15, fontWeight: 600, border: "0.5px solid var(--rule)", cursor: "pointer" }}>
            ✏️ עריכת פרטים
          </button>
          <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: 100, background: "rgba(229,85,85,0.1)", color: "#C0392B", fontSize: 15, fontWeight: 600, border: "0.5px solid rgba(229,85,85,0.3)", cursor: "pointer" }}>
            יציאה מהחשבון
          </button>
        </div>
      )}
    </div>
  );
}
