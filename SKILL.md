# SKILL.md — PDF Analyser Dashboard

## Overview

This skill creates a **Next.js + Tailwind CSS** application that analyses PDF documents and renders a dynamic, multi-tab analytics dashboard. The user uploads a PDF; the app extracts text, runs linguistic analysis, and visualises the results with charts and statistics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| PDF Parsing | `pdfjs-dist` (client-side, Web Worker) |
| Charts | Recharts (Bar, Area, Line, Pie) |
| Icons | Inline SVG |
| Fonts | Google Fonts — Playfair Display, DM Sans, JetBrains Mono |

---

## Project Structure

```
pdf-analyzer/
├── app/
│   ├── globals.css         ← Design tokens, animations, utility classes
│   ├── layout.tsx          ← Root layout with metadata
│   └── page.tsx            ← State machine: idle → loading → dashboard
├── components/
│   ├── UploadZone.tsx      ← Drag-and-drop / click-to-upload UI
│   ├── LoadingAnalysis.tsx ← Animated step-by-step loading screen
│   ├── Dashboard.tsx       ← Multi-tab analytics dashboard
│   └── StatCard.tsx        ← Reusable KPI stat card
├── lib/
│   └── pdfAnalysis.ts      ← Core analysis engine (pure functions)
├── public/
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Analysis Engine (`lib/pdfAnalysis.ts`)

### `extractTextFromPDF(file: File)`

Dynamically imports `pdfjs-dist` and loads the CDN worker. Iterates through all pages, joins text content items, and returns:

```ts
{ pages: string[], fullText: string }
```

**Important:** Always derive the worker URL from `pdfjsLib.version` to avoid version mismatches:

```ts
const version = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
```

---

### `analyzeText(fullText, pages, fileName, fileSize)`

Returns a `PDFAnalysis` object with the following computed fields:

| Field | Description |
|-------|-------------|
| `totalWords` | Whitespace-split word count |
| `totalChars` | Non-whitespace character count |
| `totalSentences` | Sentences split on `.!?` |
| `totalParagraphs` | Double-newline paragraph count |
| `avgWordsPerPage` | `totalWords / pages.length` |
| `avgSentenceLength` | `totalWords / totalSentences` |
| `readingTimeMinutes` | `totalWords / 238` (average adult reading speed) |
| `topWords` | Top 20 non-stopword words with frequency counts |
| `topBigrams` | Top 10 two-word phrases by frequency |
| `sentiment` | Positive/Negative/Neutral % + overall label |
| `pageStats` | Per-page word, char, sentence counts |
| `keyTopics` | Top 8 keywords capitalised as topic labels |
| `summary` | First 2 substantial sentences as auto-summary |
| `uniqueWords` | Set size of all lowercased words |
| `vocabularyRichness` | `uniqueWords / totalWords * 100` |
| `longestSentence` | The single sentence with most tokens |
| `extractedText` | First 2000 chars of full text |

---

## Sentiment Analysis

Uses two curated word lists:

- **POSITIVE_WORDS**: Words like `good`, `excellent`, `growth`, `achieve`, `innovative`, etc.
- **NEGATIVE_WORDS**: Words like `fail`, `loss`, `crisis`, `uncertain`, `decline`, etc.

Formula:
```
positiveRatio = positiveCount / (positiveCount + negativeCount) * 100
overall = positive if positiveCount > negativeCount * 1.2
        = negative if negativeCount > positiveCount * 1.2
        = neutral otherwise
```

> ⚠ This is a rule-based heuristic. For production, replace with an NLP API (e.g. Anthropic Claude, OpenAI, HuggingFace) for accurate contextual sentiment.

---

## Dashboard Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Auto-summary, 8 KPI stat cards, key topic pills, top 10 words bar chart, sentiment pie chart |
| **Word Analysis** | Top 20 keyword list with frequency bars, top 10 bigrams, vocabulary stats, longest sentence |
| **Page Stats** | Words/sentences per page area charts, full per-page data table |
| **Sentiment** | Overall verdict card with emoji, 3 progress meter cards, large pie chart |
| **Extracted Text** | Raw first-2000-char text preview in monospace code block |

---

## Design System

CSS variables (defined in `globals.css`) power the entire colour system:

```css
:root {
  --bg-primary: #0e0b08;      /* Deep dark brown-black */
  --bg-card: #211b14;         /* Card surfaces */
  --accent-gold: #d4a853;     /* Primary accent */
  --accent-emerald: #3ecf8e;  /* Positive / growth */
  --accent-rose: #f06b7a;     /* Negative / warning */
  --accent-sky: #5ab4d6;      /* Info / pages */
  --accent-purple: #b07fd6;   /* Vocab / uniqueness */
}
```

Key utility classes:
- `.gradient-text` — Gold gradient on text
- `.card-shine` — Hover shine sweep effect
- `.noise-overlay` — Subtle noise texture
- `.drop-zone-active` — Glowing drop target
- `.dot-grid` — Dot pattern background

---

## App State Machine

```
idle  →(file dropped/selected)→  loading  →(analysis complete)→  dashboard
  ↑                                                                    |
  └────────────────────(click "New PDF" button)───────────────────────┘
```

State is managed in `app/page.tsx` with a single `useState<"idle" | "loading" | "dashboard">`.

---

## How to Extend This Skill

### Add Claude AI summarisation

In `lib/pdfAnalysis.ts`, after text extraction call:
```ts
const aiSummary = await fetch("/api/summarise", {
  method: "POST",
  body: JSON.stringify({ text: fullText.slice(0, 8000) }),
});
```

Create `app/api/summarise/route.ts` using the Anthropic SDK.

### Add readability scores

Implement Flesch-Kincaid or Gunning Fog index:
```ts
const fleschKincaid = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words);
```

### Support scanned PDFs

Integrate Tesseract.js for OCR on image-based PDFs:
```bash
npm install tesseract.js
```

### Export analytics as PDF/CSV

Use the `pdf` or `xlsx` skill to generate downloadable reports from the analysis data.

---

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

**Required packages:**
```bash
npm install pdfjs-dist recharts lucide-react framer-motion
```

---

## Known Limitations

1. **Scanned PDFs**: `pdfjs-dist` cannot extract text from image-based PDFs. Show an error and suggest OCR tools.
2. **Very large PDFs**: Files over 50MB or 500+ pages may be slow. Consider chunking or a server-side approach.
3. **Non-English documents**: Stop-word filtering and sentiment lists are English-only.
4. **Protected PDFs**: Password-protected PDFs will fail to parse. Display a helpful error message.
5. **Font encoding**: Some PDFs use non-standard encoding that produces garbled text. Validate text quality before analysis.
