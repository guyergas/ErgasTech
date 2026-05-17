"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState("⏳ Page mounted - waiting...");

  useEffect(() => {
    setStatus("⏳ Auth check starting...");

    fetch("/api/trip/auth")
      .then((r) => {
        setStatus("📨 Response received");
        return r.json();
      })
      .then((d) => {
        setStatus(`✅ Auth check done: isAdmin = ${d.isAdmin}`);
      })
      .catch((e) => {
        setStatus(`❌ Auth error: ${e instanceof Error ? e.message : String(e)}`);
      });
  }, []);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "white",
      color: "black",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffcc",
        border: "3px solid black",
        padding: "20px",
        borderRadius: "8px"
      }}>
        <h1 style={{ margin: "0 0 20px 0", color: "black" }}>🔧 Admin Page - Debug</h1>

        <div style={{
          backgroundColor: "white",
          border: "2px solid black",
          padding: "15px",
          marginBottom: "20px",
          minHeight: "40px",
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          {status}
        </div>

        <p style={{ color: "black", fontSize: "14px" }}>
          ✓ If you're reading this, the basic page loaded successfully.<br/>
          ✓ Check the status box above to see what's happening.
        </p>

        <button
          onClick={() => setStatus("Button clicked at " + new Date().toLocaleTimeString())}
          style={{
            padding: "10px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Click Me to Test
        </button>
      </div>
    </div>
  );
}
