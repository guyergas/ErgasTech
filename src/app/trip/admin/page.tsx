"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [debug, setDebug] = useState<string>("Page loaded");

  useEffect(() => {
    setDebug((prev) => prev + "\n→ Auth check starting...");

    fetch("/api/trip/auth")
      .then((r) => {
        setDebug((prev) => prev + "\n→ Auth response received");
        return r.json();
      })
      .then((d) => {
        setDebug((prev) => prev + `\n→ Auth complete: isAdmin=${d.isAdmin}`);
        setIsAdmin(d.isAdmin);
      })
      .catch((err) => {
        setDebug((prev) => prev + `\n→ Auth error: ${err instanceof Error ? err.message : String(err)}`);
        setIsAdmin(false);
      });
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Debug panel */}
      <div style={{
        backgroundColor: "#1a1a1a",
        color: "#00ff00",
        fontFamily: "monospace",
        fontSize: "12px",
        padding: "10px",
        marginBottom: "20px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxHeight: "200px",
        overflowY: "auto",
        border: "1px solid #00ff00"
      }}>
        {debug}
      </div>

      {/* Main content */}
      {isAdmin === null && (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "18px" }}>
          ⏳ טוען...
        </div>
      )}

      {isAdmin === false && (
        <div style={{ textAlign: "center", padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>כניסת משפחה</h1>
          <p style={{ marginBottom: "24px" }}>רק בני משפחה יכולים לפרסם זיכרונות</p>
          <a
            href={`/trip/login?next=/trip/admin`}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#5876A0",
              color: "#fff",
              borderRadius: "100px",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            כניסה
          </a>
        </div>
      )}

      {isAdmin === true && (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#ccffcc", color: "#00cc00", padding: "12px", marginBottom: "20px", borderRadius: "4px" }}>
            ✅ Admin mode active
          </div>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            📝 הטופס המלא יופיע כאן במהרה...
          </p>
          <button
            onClick={() => router.push("/trip")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#5876A0",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            חזור לדף הבית
          </button>
        </div>
      )}
    </div>
  );
}
