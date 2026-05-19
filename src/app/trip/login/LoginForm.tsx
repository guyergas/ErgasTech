"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/trip";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/trip/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        router.push(next);
      } else {
        const data = await res.json();
        setError(data.error || "כתובת אימייל לא מורשית");
      }
    } catch (err) {
      setError("שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "60px 20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <Link
          href="/trip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "var(--ink-3)",
            textDecoration: "none",
            marginBottom: 40,
          }}
        >
          ← חזרה
        </Link>

        <h1
          className="trip-serif"
          style={{
            margin: "0 0 8px",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--terra-d)",
          }}
        >
          כניסה
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            fontSize: 14,
            color: "var(--ink-2)",
          }}
        >
          הזינו את כתובת האימייל שלכם כדי להתחבר
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="אימייל"
            required
            disabled={loading}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid var(--rule)",
              fontSize: 16,
              color: "var(--ink)",
              background: "var(--paper)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: 8,
                background: "rgba(220,53,69,0.1)",
                border: "1px solid rgba(220,53,69,0.3)",
                fontSize: 13,
                color: "#C0392B",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              padding: "14px",
              borderRadius: 12,
              background: "var(--terra)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: loading || !email.trim() ? "default" : "pointer",
              opacity: loading || !email.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "מתחברים..." : "כניסה"}
          </button>
        </form>

        <p
          style={{
            margin: "24px 0 0",
            fontSize: 12,
            color: "var(--ink-3)",
            textAlign: "center",
          }}
        >
          רק אנשי משפחה מורשים יכולים להתחבר
        </p>
      </div>
    </div>
  );
}
