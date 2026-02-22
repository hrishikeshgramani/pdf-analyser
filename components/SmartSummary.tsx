"use client";

import { useState, useEffect } from "react";
import type { PDFAnalysis } from "@/lib/pdfAnalysis";

interface Props {
  analysis: PDFAnalysis;
  fullText: string;
}

interface SummaryData {
  tldr: string;
  overview: string;
  keyPoints: string[];
  sections: { title: string; summary: string }[];
  actionItems: string[];
  audience: string;
  documentType: string;
  complexity: "Beginner" | "Intermediate" | "Advanced" | "Technical";
  tags: string[];
}

type Status = "idle" | "loading" | "done" | "error";

const COMPLEXITY_COLOR: Record<string, string> = {
  Beginner: "var(--accent-emerald)",
  Intermediate: "var(--accent-sky)",
  Advanced: "var(--accent-gold)",
  Technical: "var(--accent-rose)",
};

const DOC_TYPE_ICON: Record<string, string> = {
  "Research Paper": "🔬",
  Report: "📊",
  Contract: "📝",
  Manual: "🔧",
  Article: "📰",
  Book: "📚",
  Presentation: "🖥️",
  Invoice: "🧾",
  Resume: "👤",
  Other: "📄",
};

export default function SmartSummary({ analysis, fullText }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [streamText, setStreamText] = useState("");

  const generateSummary = async () => {
    setStatus("loading");
    setStreamText("");
    setErrorMsg("");

    // Truncate to ~6000 words to stay within token limits
    const textSnippet = fullText.slice(0, 24000);

    const prompt = `You are an expert document analyst. Analyse the following PDF document text and return a structured JSON summary that helps someone quickly understand what this document is about.

Document filename: "${analysis.fileName}"
Total pages: ${analysis.totalPages}
Total words: ${analysis.totalWords}
Top keywords: ${analysis.topWords.slice(0, 10).map((w) => w.word).join(", ")}

Document text (may be truncated):
"""
${textSnippet}
"""

Return ONLY valid JSON (no markdown, no backticks, no preamble) in this exact structure:
{
  "tldr": "One sentence (max 25 words) capturing the absolute essence of this document.",
  "overview": "2-3 sentence paragraph explaining what this document is, its purpose, and key context.",
  "documentType": "One of: Research Paper, Report, Contract, Manual, Article, Book, Presentation, Invoice, Resume, Other",
  "complexity": "One of: Beginner, Intermediate, Advanced, Technical",
  "audience": "Who this document is written for (1 sentence)",
  "keyPoints": [
    "Most important insight or finding #1",
    "Most important insight or finding #2",
    "Most important insight or finding #3",
    "Most important insight or finding #4",
    "Most important insight or finding #5"
  ],
  "sections": [
    { "title": "Section or theme name", "summary": "1-2 sentence summary of this section" },
    { "title": "Section or theme name", "summary": "1-2 sentence summary of this section" },
    { "title": "Section or theme name", "summary": "1-2 sentence summary of this section" }
  ],
  "actionItems": [
    "Concrete takeaway or action item from this document",
    "Another key takeaway"
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    try {
      const response = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || `API error ${response.status}`);
      }

      const data = await response.json();
      const raw = data.content?.map((b: any) => b.text || "").join("") || "";

      // Strip any accidental markdown fences
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed: SummaryData = JSON.parse(cleaned);

      setSummary(parsed);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate summary.");
      setStatus("error");
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* ── Idle state ── */}
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(62,207,142,0.1))",
              border: "1px solid rgba(212,168,83,0.3)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>

          <h2
            className="font-display mb-3"
            style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: 700 }}
          >
            AI-Powered Summary
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "420px", lineHeight: 1.7, marginBottom: "2rem" }}>
            Let Claude analyse your document and generate a structured, plain-English summary —
            TL;DR, key points, section breakdowns, action items and more.
          </p>

          <button
            onClick={generateSummary}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold), #c49340)",
              color: "#1a1208",
              boxShadow: "0 4px 24px rgba(212,168,83,0.3)",
              cursor: "pointer",
              border: "none",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Smart Summary
          </button>

          <p className="mt-4 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Powered by Claude · {analysis.totalWords.toLocaleString()} words · ~{analysis.readingTimeMinutes} min read
          </p>
        </div>
      )}

      {/* ── Loading state ── */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative w-16 h-16 mb-8">
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid transparent", borderTopColor: "var(--accent-gold)", animation: "spin 1s linear infinite" }}
            />
            <div
              className="absolute rounded-full"
              style={{ inset: "8px", border: "2px solid transparent", borderTopColor: "var(--accent-emerald)", animation: "spin 1.5s linear infinite reverse" }}
            />
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{ inset: "16px", background: "var(--bg-card)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
          <p className="font-display" style={{ fontSize: "1.2rem", color: "var(--text-primary)", fontWeight: 600 }}>
            Claude is reading your document...
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Extracting insights, key points & structure
          </p>
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error state ── */}
      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="rounded-2xl px-8 py-6 mb-6 max-w-lg"
            style={{ background: "rgba(240,107,122,0.08)", border: "1px solid rgba(240,107,122,0.3)" }}
          >
            <div style={{ color: "var(--accent-rose)", fontWeight: 600, marginBottom: "8px" }}>⚠ Summary Failed</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{errorMsg}</p>
          </div>
          <button
            onClick={generateSummary}
            className="px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Done state ── */}
      {status === "done" && summary && (
        <div className="space-y-6">
          {/* Hero: TL;DR */}
          <div
            className="rounded-2xl p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(62,207,142,0.05) 100%)",
              border: "1px solid rgba(212,168,83,0.25)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-mono text-xs px-3 py-1 rounded-full uppercase tracking-widest"
                style={{
                  background: "rgba(212,168,83,0.15)",
                  border: "1px solid rgba(212,168,83,0.3)",
                  color: "var(--accent-gold)",
                }}
              >
                TL;DR
              </span>
            </div>
            <p
              className="font-display"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.5 }}
            >
              {summary.tldr}
            </p>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Doc type */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <span style={{ fontSize: "1.5rem" }}>{DOC_TYPE_ICON[summary.documentType] || "📄"}</span>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Type</div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{summary.documentType}</div>
              </div>
            </div>

            {/* Complexity */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${COMPLEXITY_COLOR[summary.complexity]}18`, border: `1px solid ${COMPLEXITY_COLOR[summary.complexity]}30` }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COMPLEXITY_COLOR[summary.complexity]} strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complexity</div>
                <div style={{ color: COMPLEXITY_COLOR[summary.complexity], fontSize: "0.85rem", fontWeight: 600 }}>{summary.complexity}</div>
              </div>
            </div>

            {/* Pages */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(90,180,214,0.1)", border: "1px solid rgba(90,180,214,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sky)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pages</div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{analysis.totalPages} pages</div>
              </div>
            </div>

            {/* Read time */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(176,127,214,0.1)", border: "1px solid rgba(176,127,214,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Read Time</div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{analysis.readingTimeMinutes} min</div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent-sky)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sky)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent-sky)" }}>Overview</span>
            </div>
            <p style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>{summary.overview}</p>
          </div>

          {/* Audience */}
          <div
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "var(--accent-gold)" }}>Intended Audience</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{summary.audience}</p>
            </div>
          </div>

          {/* Key Points + Sections side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Points */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent-emerald)" }}>Key Points</span>
              </div>
              <ol className="space-y-3">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                      style={{
                        background: "rgba(62,207,142,0.12)",
                        border: "1px solid rgba(62,207,142,0.25)",
                        color: "var(--accent-emerald)",
                        marginTop: "1px",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.9rem" }}>{point}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Section Breakdown */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>Section Breakdown</span>
              </div>
              <div className="space-y-4">
                {summary.sections.map((section, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderLeft: `2px solid ${["var(--accent-gold)", "var(--accent-sky)", "var(--accent-purple)", "var(--accent-emerald)"][i % 4]}`,
                    }}
                  >
                    <div
                      className="font-semibold mb-1.5"
                      style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}
                    >
                      {section.title}
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                      {section.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Items */}
          {summary.actionItems.length > 0 && (
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(62,207,142,0.04)",
                border: "1px solid rgba(62,207,142,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent-emerald)" }}>
                  Key Takeaways & Action Items
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.actionItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ background: "rgba(62,207,142,0.06)", border: "1px solid rgba(62,207,142,0.15)" }}
                  >
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: "rgba(62,207,142,0.2)", border: "1px solid rgba(62,207,142,0.4)" }}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {summary.tags.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Document Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-mono"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          <div className="flex justify-center pt-2 pb-6">
            <button
              onClick={generateSummary}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-gold)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-light)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Regenerate Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
