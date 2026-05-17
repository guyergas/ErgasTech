"use client";

export default function AdminPage() {
  // This component has NO state, NO effects, NO hooks - just render
  return (
    <div style={{
      backgroundColor: "white",
      color: "black",
      padding: "40px 20px",
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1>🔧 Admin - Diagnostics</h1>

        <div style={{
          backgroundColor: "#ffffcc",
          border: "3px solid #333",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <p><strong>If you can read this:</strong></p>
          <ul>
            <li>✅ Page loaded successfully</li>
            <li>✅ CSS applied (white background, black text)</li>
            <li>✅ React rendered the component</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: "#ccffcc",
          border: "2px solid green",
          padding: "15px",
          marginBottom: "20px"
        }}>
          <p><strong>System Info:</strong></p>
          <p>Browser: {typeof navigator !== "undefined" ? "Browser detected" : "No browser"}</p>
          <p>Time: {new Date().toLocaleString()}</p>
          <p>URL: {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
        </div>

        <div style={{
          backgroundColor: "#ffcccc",
          border: "2px solid red",
          padding: "15px"
        }}>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>If you see this page with WHITE background → page loaded OK</li>
            <li>If you see BLACK screen → it's a server/deployment issue</li>
            <li>Tell me what you see</li>
          </ol>
        </div>

        <div style={{ marginTop: "30px" }}>
          <a
            href="/trip"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "blue",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px"
            }}
          >
            Go to /trip homepage
          </a>
        </div>
      </div>
    </div>
  );
}
