"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Parsing PDF structure...",
  "Extracting text content...",
  "Counting words & sentences...",
  "Analyzing vocabulary...",
  "Running sentiment analysis...",
  "Identifying key topics...",
  "Building visual charts...",
  "Finalizing dashboard...",
];

export default function LoadingAnalysis() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        if (s < STEPS.length - 1) return s + 1;
        return s;
      });
      setProgress((p) => Math.min(p + 12, 95));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Animated logo */}
        <div className="relative mx-auto mb-10" style={{ width: "100px", height: "100px" }}>
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--accent-gold)",
              animation: "spin 1.2s linear infinite",
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "12px",
              border: "2px solid transparent",
              borderTopColor: "var(--accent-emerald)",
              animation: "spin 1.8s linear infinite reverse",
            }}
          />
          {/* Inner */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: "24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>

        <h2
          className="font-display mb-2"
          style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: 600 }}
        >
          Analysing Document
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          This only takes a moment...
        </p>

        {/* Progress bar */}
        <div
          className="relative h-1.5 rounded-full overflow-hidden mb-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent-gold), var(--accent-emerald))",
            }}
          />
        </div>

        {/* Step indicator */}
        <p
          className="font-mono text-sm"
          style={{ color: "var(--text-muted)", minHeight: "1.5rem", transition: "all 0.3s" }}
        >
          {STEPS[step]}
        </p>

        {/* Steps list */}
        <div className="mt-8 text-left space-y-2">
          {STEPS.slice(0, step + 1).map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm"
              style={{
                color: i === step ? "var(--text-primary)" : "var(--text-muted)",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background:
                    i < step
                      ? "rgba(62,207,142,0.2)"
                      : i === step
                      ? "rgba(212,168,83,0.2)"
                      : "transparent",
                  border: `1px solid ${i < step ? "var(--accent-emerald)" : i === step ? "var(--accent-gold)" : "var(--border)"}`,
                }}
              >
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i === step ? (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--accent-gold)", animation: "pulse 1s infinite" }}
                  />
                ) : null}
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
