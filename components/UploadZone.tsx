"use client";

import { useCallback, useState, useRef } from "react";

interface Props {
  onFile: (file: File) => void;
  error: string | null;
}

export default function UploadZone({ onFile, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Header */}
      <div className="mb-16 text-center" style={{ animation: "fadeIn 0.8s ease-out forwards" }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold), rgba(212,168,83,0.6))",
              boxShadow: "0 0 20px rgba(212,168,83,0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span
            className="text-sm font-mono tracking-widest uppercase"
            style={{ color: "var(--accent-gold)", letterSpacing: "0.2em" }}
          >
            PDF Analyst
          </span>
        </div>

        <h1
          className="font-display mb-4"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}
        >
          Document
          <br />
          <span className="gradient-text">Intelligence</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "460px" }}>
          Upload any PDF and instantly receive deep analytics — word frequencies, sentiment analysis,
          reading metrics, and visual insights.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative cursor-pointer transition-all duration-300 ${isDragging ? "drop-zone-active" : ""}`}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: isDragging ? "rgba(212,168,83,0.06)" : "var(--bg-card)",
          border: `2px dashed ${isDragging ? "var(--accent-gold)" : "var(--border-light)"}`,
          borderRadius: "20px",
          padding: "60px 40px",
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />

        {/* Upload icon */}
        <div
          className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(212,168,83,0.1)",
            border: "1px solid rgba(212,168,83,0.2)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? "var(--accent-gold)" : "var(--text-secondary)"}
            strokeWidth="1.5"
            style={{ transition: "stroke 0.3s" }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p
          className="font-display mb-2"
          style={{ fontSize: "1.4rem", color: "var(--text-primary)", fontWeight: 600 }}
        >
          {isDragging ? "Drop your PDF here" : "Drop PDF or click to browse"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Supports any PDF up to 50MB · Text extraction only
        </p>

        <div
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, var(--accent-gold), rgba(212,168,83,0.7))",
            color: "#1a1208",
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Select PDF File
        </div>
      </div>

      {error && (
        <div
          className="mt-6 px-5 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(240,107,122,0.1)",
            border: "1px solid rgba(240,107,122,0.3)",
            color: "var(--accent-rose)",
            maxWidth: "600px",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3 mt-12 justify-center">
        {["Word Frequency", "Sentiment Analysis", "Reading Metrics", "Page Analytics", "Key Topics", "Vocabulary Insights"].map(
          (feature) => (
            <span
              key={feature}
              className="px-4 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {feature}
            </span>
          )
        )}
      </div>
    </div>
  );
}
