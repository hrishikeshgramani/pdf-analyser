"use client";

import { useState } from "react";
import SmartSummary from "./SmartSummary";
import type { PDFAnalysis } from "@/lib/pdfAnalysis";
import { formatFileSize } from "@/lib/pdfAnalysis";
import StatCard from "./StatCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";

interface Props {
  analysis: PDFAnalysis;
  fullText: string;
  onReset: () => void;
}

const COLORS = [
  "var(--accent-gold)",
  "var(--accent-emerald)",
  "var(--accent-sky)",
  "var(--accent-rose)",
  "var(--accent-purple)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || "var(--accent-gold)", fontWeight: 600 }}>
          {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ analysis, fullText, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "overview" | "words" | "pages" | "sentiment" | "text">(
    "summary"
  );

  const sentimentData = [
    { name: "Positive", value: analysis.sentiment.positive, color: "var(--accent-emerald)" },
    { name: "Negative", value: analysis.sentiment.negative, color: "var(--accent-rose)" },
    { name: "Neutral", value: analysis.sentiment.neutral, color: "var(--text-muted)" },
  ];

  const overallSentimentColor =
    analysis.sentiment.overall === "positive"
      ? "var(--accent-emerald)"
      : analysis.sentiment.overall === "negative"
      ? "var(--accent-rose)"
      : "var(--text-secondary)";

  const tabs = [
    { id: "summary", label: "✦ Smart Summary" },
    { id: "overview", label: "Overview" },
    { id: "words", label: "Word Analysis" },
    { id: "pages", label: "Page Stats" },
    { id: "sentiment", label: "Sentiment" },
    { id: "text", label: "Extracted Text" },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(14,11,8,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold), rgba(212,168,83,0.6))",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <div
              className="font-mono text-xs"
              style={{ color: "var(--accent-gold)", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              PDF Analyst
            </div>
            <div
              className="text-xs"
              style={{
                color: "var(--text-muted)",
                maxWidth: "280px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {analysis.fileName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="text-xs px-3 py-1.5 rounded-full font-mono"
            style={{
              background: "rgba(212,168,83,0.1)",
              border: "1px solid rgba(212,168,83,0.2)",
              color: "var(--accent-gold)",
            }}
          >
            {formatFileSize(analysis.fileSize)} · {analysis.totalPages}p
          </div>
          <button
            onClick={onReset}
            className="text-xs px-4 py-1.5 rounded-full font-medium transition-all"
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
            ↩ New PDF
          </button>
        </div>
      </nav>

      {/* Tab navigation */}
      <div
        className="sticky top-[65px] z-40 px-6 flex gap-1 py-3 overflow-x-auto"
        style={{
          background: "rgba(14,11,8,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
              border: `1px solid ${activeTab === tab.id ? "var(--border-light)" : "transparent"}`,
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {activeTab === tab.id && (
              <span style={{ color: "var(--accent-gold)", marginRight: "6px" }}>▸</span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ========== SMART SUMMARY TAB ========== */}
        {activeTab === "summary" && (
          <SmartSummary analysis={analysis} fullText={fullText} />
        )}

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            {/* Summary card */}
            <div
              className="rounded-2xl p-6 mb-8"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--accent-gold)",
              }}
            >
              <div
                className="font-mono text-xs mb-3 uppercase tracking-widest"
                style={{ color: "var(--accent-gold)" }}
              >
                Document Summary
              </div>
              <p style={{ color: "var(--text-primary)", lineHeight: 1.7 }}>{analysis.summary}</p>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Words"
                value={analysis.totalWords.toLocaleString()}
                sub="across all pages"
                accent="var(--accent-gold)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                }
              />
              <StatCard
                label="Total Pages"
                value={analysis.totalPages}
                sub={`~${analysis.avgWordsPerPage} words/page`}
                accent="var(--accent-sky)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sky)" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
              />
              <StatCard
                label="Reading Time"
                value={`${analysis.readingTimeMinutes} min`}
                sub="at 238 wpm avg"
                accent="var(--accent-emerald)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <StatCard
                label="Unique Words"
                value={analysis.uniqueWords.toLocaleString()}
                sub={`${analysis.vocabularyRichness}% vocabulary richness`}
                accent="var(--accent-purple)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                }
              />
              <StatCard
                label="Sentences"
                value={analysis.totalSentences.toLocaleString()}
                sub={`avg ${analysis.avgSentenceLength} words each`}
                accent="var(--accent-gold)"
              />
              <StatCard
                label="Paragraphs"
                value={analysis.totalParagraphs.toLocaleString()}
                accent="var(--accent-sky)"
              />
              <StatCard
                label="Characters"
                value={analysis.totalChars.toLocaleString()}
                sub="non-whitespace"
                accent="var(--accent-emerald)"
              />
              <StatCard
                label="Sentiment"
                value={analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}
                sub={`${analysis.sentiment.positive}% positive`}
                accent={overallSentimentColor}
              />
            </div>

            {/* Key topics */}
            <div
              className="rounded-2xl p-6 mb-8"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3
                className="font-display mb-5"
                style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
              >
                Key Topics
              </h3>
              <div className="flex flex-wrap gap-3">
                {analysis.keyTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: `${COLORS[i % COLORS.length]}18`,
                      border: `1px solid ${COLORS[i % COLORS.length]}40`,
                      color: COLORS[i % COLORS.length],
                    }}
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top words bar */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Top 10 Words
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analysis.topWords.slice(0, 10)} layout="vertical" barSize={8}>
                    <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="word" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="var(--accent-gold)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sentiment donut */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Sentiment Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, ""]}
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========== WORD ANALYSIS TAB ========== */}
        {activeTab === "words" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top 20 words */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Top 20 Keywords
                </h3>
                <div className="space-y-2">
                  {analysis.topWords.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="font-mono text-xs w-6 text-right flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {i + 1}
                      </div>
                      <div
                        className="flex-1 text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.word}
                      </div>
                      <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{
                            width: `${(item.count / analysis.topWords[0].count) * 100}%`,
                            background: `${COLORS[i % COLORS.length]}`,
                            transition: "width 1s ease",
                          }}
                        />
                      </div>
                      <div
                        className="font-mono text-xs w-8 text-right flex-shrink-0"
                        style={{ color: "var(--accent-gold)" }}
                      >
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top bigrams */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Top Phrase Pairs (Bigrams)
                </h3>
                <div className="space-y-3">
                  {analysis.topBigrams.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="font-mono text-xs w-6 text-right flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {i + 1}
                      </div>
                      <div
                        className="flex-1 text-sm px-3 py-1.5 rounded-lg"
                        style={{
                          background: `${COLORS[i % COLORS.length]}10`,
                          border: `1px solid ${COLORS[i % COLORS.length]}25`,
                          color: COLORS[i % COLORS.length],
                          fontWeight: 500,
                        }}
                      >
                        {item.word}
                      </div>
                      <div
                        className="font-mono text-xs w-8 text-right flex-shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        ×{item.count}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vocabulary stats */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                >
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div
                        className="font-display text-2xl font-bold"
                        style={{ color: "var(--accent-purple)" }}
                      >
                        {analysis.uniqueWords.toLocaleString()}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Unique Words</div>
                    </div>
                    <div>
                      <div
                        className="font-display text-2xl font-bold"
                        style={{ color: "var(--accent-emerald)" }}
                      >
                        {analysis.vocabularyRichness}%
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Vocab Richness</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Word frequency bar chart */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3
                className="font-display mb-5"
                style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
              >
                Word Frequency Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.topWords.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="word" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analysis.topWords.slice(0, 15).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Longest sentence */}
            {analysis.longestSentence && (
              <div
                className="mt-6 rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent-purple)",
                }}
              >
                <div
                  className="font-mono text-xs mb-3 uppercase tracking-widest"
                  style={{ color: "var(--accent-purple)" }}
                >
                  Longest Sentence Detected
                </div>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
                  "{analysis.longestSentence}..."
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== PAGES TAB ========== */}
        {activeTab === "pages" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Words per page line chart */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Words Per Page
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analysis.pageStats}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="page" tick={{ fill: "var(--text-muted)", fontSize: 11 }} label={{ value: "Page", position: "insideBottom", fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="wordCount"
                      stroke="var(--accent-gold)"
                      strokeWidth={2}
                      fill="url(#goldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sentence count per page */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-display mb-5"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Sentences Per Page
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analysis.pageStats}>
                    <defs>
                      <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="page" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sentenceCount"
                      stroke="var(--accent-emerald)"
                      strokeWidth={2}
                      fill="url(#emeraldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Page table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Page-by-Page Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Page", "Words", "Characters", "Sentences"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.pageStats.map((ps, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td className="px-6 py-3" style={{ color: "var(--accent-gold)", fontWeight: 600 }}>
                          {ps.page}
                        </td>
                        <td className="px-6 py-3" style={{ color: "var(--text-primary)" }}>
                          {ps.wordCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>
                          {ps.charCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>
                          {ps.sentenceCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== SENTIMENT TAB ========== */}
        {activeTab === "sentiment" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            {/* Overall verdict */}
            <div
              className="rounded-2xl p-8 mb-8 text-center"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${overallSentimentColor}`,
                boxShadow: `0 0 40px ${overallSentimentColor}15`,
              }}
            >
              <div
                className="text-6xl mb-4"
              >
                {analysis.sentiment.overall === "positive" ? "😊" : analysis.sentiment.overall === "negative" ? "😟" : "😐"}
              </div>
              <div
                className="font-display text-4xl font-bold mb-2"
                style={{ color: overallSentimentColor }}
              >
                {analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)} Tone
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                The document carries an overall {analysis.sentiment.overall} sentiment based on keyword analysis.
              </p>
            </div>

            {/* Sentiment meters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {sentimentData.map((s) => (
                <div
                  key={s.name}
                  className="rounded-2xl p-6"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{s.name}</span>
                    <span
                      className="font-display text-2xl font-bold"
                      style={{ color: s.color }}
                    >
                      {s.value}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${s.value}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pie chart */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3
                className="font-display mb-5"
                style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
              >
                Sentiment Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={{ stroke: "var(--text-muted)" }}
                  >
                    {sentimentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, ""]}
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ========== TEXT TAB ========== */}
        {activeTab === "text" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-display"
                  style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Extracted Text Preview
                </h3>
                <span
                  className="text-xs px-3 py-1 rounded-full font-mono"
                  style={{
                    background: "rgba(212,168,83,0.1)",
                    border: "1px solid rgba(212,168,83,0.2)",
                    color: "var(--accent-gold)",
                  }}
                >
                  First 2000 chars
                </span>
              </div>
              <pre
                className="text-sm leading-relaxed whitespace-pre-wrap font-body rounded-xl p-5 overflow-auto max-h-[600px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {analysis.extractedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
