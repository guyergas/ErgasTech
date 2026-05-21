"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/trip/auth", { credentials: "include" });
        const data = await res.json();
        setAuthStatus(data);
      } catch (err) {
        setAuthStatus({ error: String(err) });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Debug: Auth Status</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ background: "var(--paper)", padding: 16, borderRadius: 8, marginBottom: 20, fontFamily: "monospace", fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p><strong>Is Admin:</strong> {authStatus?.isAdmin ? "✓ YES" : "✗ NO"}</p>
            <p><strong>User ID:</strong> {authStatus?.userId || "None"}</p>
          </div>

          <button
            onClick={async () => {
              const res = await fetch("/api/trip/auth", { credentials: "include" });
              const data = await res.json();
              setAuthStatus(data);
            }}
            style={{
              padding: "10px 20px",
              background: "var(--terra)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginRight: 8,
            }}
          >
            Refresh Status
          </button>

          <button
            onClick={async () => {
              await fetch("/api/trip/auth", { method: "DELETE", credentials: "include" });
              const res = await fetch("/api/trip/auth", { credentials: "include" });
              const data = await res.json();
              setAuthStatus(data);
            }}
            style={{
              padding: "10px 20px",
              background: "#C0392B",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
