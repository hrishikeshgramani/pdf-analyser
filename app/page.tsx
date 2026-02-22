"use client";

import { useState, useCallback } from "react";
import { extractTextFromPDF, analyzeText, type PDFAnalysis } from "@/lib/pdfAnalysis";
import UploadZone from "@/components/UploadZone";
import Dashboard from "@/components/Dashboard";
import LoadingAnalysis from "@/components/LoadingAnalysis";

type AppState = "idle" | "loading" | "dashboard";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [fullText, setFullText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB.");
      return;
    }

    setError(null);
    setState("loading");

    try {
      const { pages, fullText: extracted } = await extractTextFromPDF(file);
      if (!extracted.trim()) {
        throw new Error("No text found. The PDF may be scanned or image-based.");
      }
      const result = analyzeText(extracted, pages, file.name, file.size);
      setAnalysis(result);
      setFullText(extracted);
      setState("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to analyze PDF.");
      setState("idle");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setAnalysis(null);
    setFullText("");
    setError(null);
  };

  return (
    <main className="min-h-screen noise-overlay" style={{ background: "var(--bg-primary)" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,168,83,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(62,207,142,0.04) 0%, transparent 60%)",
        }}
      />

      {state === "idle" && <UploadZone onFile={handleFile} error={error} />}
      {state === "loading" && <LoadingAnalysis />}
      {state === "dashboard" && analysis && (
        <Dashboard analysis={analysis} fullText={fullText} onReset={handleReset} />
      )}
    </main>
  );
}
