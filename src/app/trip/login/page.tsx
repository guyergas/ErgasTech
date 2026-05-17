"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/trip";
  const modeParam = searchParams.get("mode"); // "signup" to open signup directly

  const [mode, setMode] = useState<"login" | "signup">(modeParam === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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

  function switchMode(m: "login" | "signup") {
    setMode(m);
    setError("");
    setEmail("");
    setName("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // Check if admin
    const res = await fetch("/api/trip/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail }),
    });

    if (res.ok) {
      // Admin — restore name from localStorage if exists, issue cookie
      const existing = (() => { try { return JSON.parse(localStorage.getItem("trip_guest") ?? "{}"); } catch { return {}; } })();
      try { localStorage.setItem("trip_guest", JSON.stringify({ name: existing.name ?? trimmedEmail.split("@")[0], email: trimmedEmail })); } catch { /* ignore */ }
      router.push("/trip/admin");
      return;
    }

    // Check if returning guest (email already stored locally)
    try {
      const raw = localStorage.getItem("trip_guest");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.email?.toLowerCase() === trimmedEmail) {
          setAlreadyIn(true);
          setCurrentName(parsed.name ?? "");
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    // Unknown email — prompt signup
    setError("לא מצאנו את הכתובת הזו. משתמש/ת חדש/ה?");
    setLoading(false);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const identity = { name: name.trim(), email: email.trim().toLowerCase() };
    try { localStorage.setItem("trip_guest", JSON.stringify(identity)); } catch { /* ignore */ }

    // Also try admin login silently (no await needed for UX)
    fetch("/api/trip/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identity.email }),
    }).then((r) => {
      if (r.ok) router.push("/trip/admin");
      else router.push(next);
    }).catch(() => router.push(next));
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
      <p style={{ margin: "8px 0 24px", fontSize: 15, color: "var(--ink-2)" }}>
        {mode === "login" ? "כניסה לחשבון" : "הצטרפות למסע"}
      </p>

      <div style={{ width: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "28px 24px", boxShadow: "var(--shadow-card)", backdropFilter: "blur(12px)" }}>
        {alreadyIn ? (
          /* Already logged in */
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              {currentName.slice(0, 1).toUpperCase()}
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
        ) : mode === "login" ? (
          /* Login form */
          <form onSubmit={handleLogin}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>כניסה</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)" }}>הכניסו את כתובת האימייל שלכם</p>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="כתובת אימייל"
              required
              autoFocus
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${error ? "var(--rule)" : "var(--rule)"}`, fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }}
            />
            {error && (
              <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(197,161,78,0.12)", border: "0.5px solid rgba(197,161,78,0.4)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--ochre)", fontWeight: 600 }}>{error}</p>
                <button type="button" onClick={() => switchMode("signup")}
                  style={{ fontSize: 13, color: "var(--terra)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  לחצו כאן להרשמה
                </button>
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "כניסה"}
            </button>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
              משתמש/ת חדש/ה?{" "}
              <button type="button" onClick={() => switchMode("signup")}
                style={{ fontSize: 13, color: "var(--terra)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                הירשמו כאן
              </button>
            </p>
          </form>
        ) : (
          /* Sign up form */
          <form onSubmit={handleSignup}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>הרשמה</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)" }}>הכניסו כינוי ואימייל — הם יופיעו על התגובות שלכם</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="כינוי (למשל: דודה רות)"
              required
              autoFocus
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rule)", fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" as const }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת אימייל"
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rule)", fontSize: 16, color: "var(--ink)", background: "var(--ivory)", outline: "none", fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" as const }}
            />
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 100, background: "var(--terra)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "הצטרפות"}
            </button>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
              כבר יש לכם חשבון?{" "}
              <button type="button" onClick={() => switchMode("login")}
                style={{ fontSize: 13, color: "var(--terra)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                כניסה
              </button>
            </p>
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
