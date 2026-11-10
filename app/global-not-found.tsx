import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "96px 24px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p
            style={{
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#75c043",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Error 404
          </p>
          <h1
            style={{
              fontSize: "2.3rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: "#3a3a3a",
              marginBottom: 24,
            }}
          >
            Page Not Found.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "#6b6d7a",
              maxWidth: 560,
              marginBottom: 40,
            }}
          >
            We couldn&apos;t find the page you were looking for. It might have
            been moved or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            style={{
              backgroundColor: "#75c043",
              color: "#fff",
              fontWeight: 700,
              padding: "16px 40px",
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Return to Homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
