"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "40px 20px 60px",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo area */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          className="trip-hand"
          style={{
            fontSize: 64,
            marginBottom: 8,
            display: "block",
          }}
        >
          ✦
        </div>
        <h1
          className="trip-serif"
          style={{
            margin: 0,
            fontSize: 34,
            fontWeight: 500,
            color: "var(--terra-d)",
          }}
        >
          יומן ארגס
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            color: "var(--ink-2)",
            lineHeight: 1.5,
          }}
        >
          כדי לעקוב, להגיב ולהיות חלק מהמסע
        </p>
      </div>

      {!sent ? (
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.9)",
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: "var(--shadow-card)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            כניסה / הרשמה
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: "var(--ink-3)",
            }}
          >
            נשלח לכם קישור כניסה לאימייל
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת אימייל"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid var(--rule)",
                fontSize: 16,
                color: "var(--ink)",
                background: "var(--ivory)",
                outline: "none",
                fontFamily: "'Heebo', sans-serif",
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 100,
                background: "var(--terra)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(88,118,160,0.35)",
              }}
            >
              שלחו לי קישור
            </button>
          </form>

          <p
            style={{
              margin: "16px 0 0",
              fontSize: 12,
              color: "var(--ink-3)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            אין סיסמאות. רק קישור מהיר לאימייל.
            <br />
            {/* TODO: connect to real magic-link auth */}
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.9)",
            borderRadius: 24,
            padding: "36px 24px",
            textAlign: "center",
            boxShadow: "var(--shadow-card)",
            backdropFilter: "blur(12px)",
          }}
          className="trip-float-in"
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2
            className="trip-serif"
            style={{
              margin: "0 0 8px",
              fontSize: 26,
              fontWeight: 500,
              color: "var(--ink)",
            }}
          >
            בדקו את האימייל
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              color: "var(--ink-2)",
              lineHeight: 1.6,
            }}
          >
            שלחנו קישור לכניסה ל-
            <strong>{email}</strong>
          </p>
          <Link
            href="/trip"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: 100,
              background: "var(--ivory)",
              color: "var(--terra-d)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              border: "0.5px solid var(--rule)",
            }}
          >
            חזרה ליומן
          </Link>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/trip"
        style={{
          marginTop: 20,
          fontSize: 13,
          color: "var(--ink-3)",
          textDecoration: "none",
        }}
      >
        ← חזרה לצפייה ביומן (ללא כניסה)
      </Link>
    </div>
  );
}
