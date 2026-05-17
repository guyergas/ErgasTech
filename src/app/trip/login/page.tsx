"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/trip";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trip_guest");
      if (raw) {
        const parsed = JSON.parse(raw);
        setAlreadyIn(true);
        setCurrentName(parsed.name ?? "");
      }
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    // Try admin login first
    const res = await fetch("/api/trip/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.ok) {
      // Admin — save to localStorage too for display, then go to admin
      try { localStorage.setItem("trip_guest", JSON.stringify({ name: name.trim(), email: email.trim() })); } catch { /* ignore */ }
      router.push("/trip/admin");
    } else {
      // Regular guest — save to localStorage and continue
      try { localStorage.setItem("trip_guest", JSON.stringify({ name: name.trim(), email: email.trim() })); } catch { /* ignore */ }
      router.push(next);
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem("trip_guest");
    setAlreadyIn(false);
    setCurrentName("");
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 60px", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="trip-hand" style={{ fontSize: 64, marginBottom: 8 }}>✦</div>
      <h1 className="trip-serif" style={{ margin: 0, fontSize: 34, fontWeight: 500, color: "var(--terra-d)" }}>יומן ארגס</h1>
      <p style={{ margin: "8px 0 24px", fontSize: 15, color: "var(--ink-2)" }}>כדי להגיב ולהיות חלק מהמסע</p>

      <div style={{ width: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "28px 24px", boxShadow: "var(--shadow-card)", backdropFilter: "blur(12px)" }}>
        {alreadyIn ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              {currentName.slice(0, 1)}
            </div>
            <h2 className="trip-serif" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>שלום, {currentName}!</h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--ink-2)" }}>אתם כבר מחוברים ויכולים להגיב</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href={next} style={{ display: "block", padding: "12px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                המשך
              </Link>
              <Link href="/trip/profile" style={{ display: "block", padding: "12px", borderRadius: 100, background: "var(--ivory)", color: "var(--ink-2)", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center", border: "0.5px solid var(--rule)" }}>
                הפרופיל שלי
              </Link>
              <button onClick={handleLogout} style={{ width: "100%", padding: "12px", borderRadius: 100, background: "transparent", color: "#C0392B", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
                יציאה מהחשבון
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>הצטרפו למסע</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)" }}>הכניסו שם ואימייל כדי להגיב על פוסטים</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלכם" required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rule)", fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="כתובת אימייל" required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rule)", fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }} />
            {error && <p style={{ color: "#e55", fontSize: 13, margin: "0 0 8px", textAlign: "center" }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "כניסה"}
            </button>
          </form>
        )}
      </div>

      <Link href="/trip" style={{ marginTop: 20, fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>
        ← חזרה לצפייה ביומן ללא כניסה
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
