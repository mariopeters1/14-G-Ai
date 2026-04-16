import Link from "next/link";
import Logo from "@/components/logo";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#06060A",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "24px" }}>
        {/* Logo */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08))",
            border: "1px solid rgba(6,182,212,0.2)",
            marginBottom: "32px",
          }}
        >
          <Logo className="h-7 w-7" />
        </div>

        {/* 404 Number */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            letterSpacing: "-4px",
            lineHeight: 1,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
            userSelect: "none",
          }}
        >
          404
        </div>

        {/* Message */}
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 500,
            color: "#E0E0E8",
            margin: "0 0 8px",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#5A5A6A",
            margin: "0 0 32px",
            maxWidth: "360px",
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#fff",
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.25)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6B6B7B",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Admin Dashboard
          </Link>
        </div>

        {/* Branding */}
        <p
          style={{
            marginTop: "48px",
            fontSize: "10px",
            color: "#2A2A38",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Gastronomic AI — Command Center
        </p>
      </div>
    </div>
  );
}
