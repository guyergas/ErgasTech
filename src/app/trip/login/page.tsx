"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"guest" | "admin">("guest");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/trip/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.push("/trip/admin");
    } else {
      setError("קוד שגוי");
    }
    setLoading(false);
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSent(true);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 60px", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="trip-hand" style={{ fontSize: 64, marginBottom: 8 }}>✦</div>
      <h1 className="trip-serif" style={{ margin: 0, fontSize: 34, fontWeight: 500, color: "var(--terra-d)" }}>יומן ארגס</h1>
      <p style={{ margin: "8px 0 24px", fontSize: 15, color: "var(--ink-2)" }}>כדי לעקוב, להגיב ולהיות חלק מהמסע</p>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["guest", "admin"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            style={{ padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: mode === m ? "var(--terra)" : "var(--ivory)", color: mode === m ? "#fff" : "var(--ink-3)" }}>
            {m === "guest" ? "עוקב/ת" : "משפחה (אדמין)"}
          </button>
        ))}
      </div>

      {!sent ? (
        <div style={{ width: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "28px 24px", boxShadow: "var(--shadow-card)", backdropFilter: "blur(12px)" }}>
          {mode === "guest" ? (
            <form onSubmit={handleGuestSubmit}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>הירשמו לעדכונים</h2>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)" }}>נשלח לכם קישור כשיפורסמו זיכרונות חדשים</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="כתובת אימייל" required
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rule)", fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" as const }} />
              <button type="submit"
                style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>
                שלחו לי קישור
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>כניסת משפחה</h2>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)" }}>הזינו את קוד ה-PIN של המשפחה</p>
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="קוד PIN" inputMode="numeric"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${error ? "#e55" : "var(--rule)"}`, fontSize: 22, textAlign: "center", letterSpacing: 8, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" as const }} />
              {error && <p style={{ textAlign: "center", color: "#e55", fontSize: 13, margin: "0 0 8px" }}>{error}</p>}
              <button type="submit" disabled={loading || !pin}
                style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "..." : "כניסה לאדמין"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "36px 24px", textAlign: "center", boxShadow: "var(--shadow-card)" }} className="trip-float-in">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 className="trip-serif" style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 500 }}>בדקו את האימייל</h2>
          <p style={{ margin: "0 0 20px", fontSize: 15, color: "var(--ink-2)" }}>שלחנו קישור לכניסה ל-<strong>{email}</strong></p>
          <Link href="/trip" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 100, background: "var(--ivory)", color: "var(--terra-d)", fontSize: 14, fontWeight: 600, textDecoration: "none", border: "0.5px solid var(--rule)" }}>
            חזרה ליומן
          </Link>
        </div>
      )}

      <Link href="/trip" style={{ marginTop: 20, fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>
        ← חזרה לצפייה ביומן ללא כניסה
      </Link>
    </div>
  );
}
