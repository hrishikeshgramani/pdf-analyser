"use client";

export interface WordFrequency {
  word: string;
  count: number;
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  overall: "positive" | "negative" | "neutral";
}

export interface PageStats {
  page: number;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
}

export interface PDFAnalysis {
  fileName: string;
  fileSize: number;
  totalPages: number;
  totalWords: number;
  totalChars: number;
  totalSentences: number;
  totalParagraphs: number;
  avgWordsPerPage: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
  topWords: WordFrequency[];
  topBigrams: WordFrequency[];
  sentiment: SentimentScore;
  pageStats: PageStats[];
  keyTopics: string[];
  summary: string;
  textDensity: number;
  uniqueWords: number;
  vocabularyRichness: number;
  longestSentence: string;
  extractedText: string;
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","say","her",
  "she","or","an","will","my","one","all","would","there","their","what","so","up",
  "out","if","about","who","get","which","go","me","when","make","can","like","time",
  "no","just","him","know","take","people","into","year","your","good","some","could",
  "them","see","other","than","then","now","look","only","come","its","over","think",
  "also","back","after","use","two","how","our","work","first","well","way","even",
  "new","want","because","any","these","give","day","most","us","is","was","are",
  "were","been","being","has","had","did","does","doing","a","an","the","and","but",
  "if","or","because","as","until","while","of","at","by","for","with","about",
  "against","between","into","through","during","before","after","above","below","to",
  "from","up","down","in","out","on","off","over","under","again","further","then",
  "once","here","there","when","where","why","how","all","both","each","few","more",
  "other","some","such","no","nor","not","only","same","so","than","too","very","can",
  "will","just","should","now","i","me","my","myself","we","our","ours","ourselves",
  "you","your","yours","yourself","he","him","his","himself","she","her","hers",
  "herself","it","its","itself","they","them","their","theirs","themselves","what",
  "which","who","whom","this","that","these","those","am","is","are","was","were",
  "be","been","being","have","has","had","having","do","does","did","doing"
]);

// Simple positive/negative word lists
const POSITIVE_WORDS = new Set([
  "good","great","excellent","outstanding","positive","success","successful","improve",
  "improvement","benefit","beneficial","effective","efficient","achieve","achievement",
  "growth","increase","gain","profit","opportunity","strong","best","better","high",
  "superior","advantage","innovation","innovative","progress","valuable","value",
  "significant","remarkable","exceptional","impressive","robust","sustainable","leading"
]);

const NEGATIVE_WORDS = new Set([
  "bad","poor","negative","fail","failure","problem","issue","challenge","risk","concern",
  "decrease","decline","loss","deficit","weak","low","inferior","disadvantage","threat",
  "crisis","difficult","difficulty","complex","complexity","costly","expensive","limited",
  "uncertain","uncertainty","adverse","critical","serious","severe","significant risk",
  "obstacle","barrier","constraint","shortage","delay","reduce","reduction"
]);

export async function extractTextFromPDF(file: File): Promise<{ pages: string[]; fullText: string }> {
  const pdfjsLib = await import("pdfjs-dist");
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  return { pages, fullText: pages.join("\n\n") };
}

export function analyzeText(
  fullText: string,
  pages: string[],
  fileName: string,
  fileSize: number
): PDFAnalysis {
  // Word tokenization
  const words = fullText
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const sentences = fullText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const paragraphs = fullText.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // Unique words
  const uniqueWordsSet = new Set(words);
  const uniqueWords = uniqueWordsSet.size;
  const vocabularyRichness = Math.round((uniqueWords / Math.max(words.length, 1)) * 100);

  // Word frequency (filtered)
  const wordFreq: Record<string, number> = {};
  words.forEach((w) => {
    const cleaned = w.replace(/^['-]|['-]$/g, "");
    if (cleaned.length > 2 && !STOP_WORDS.has(cleaned)) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Bigrams
  const bigramFreq: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].replace(/^['-]|['-]$/g, "");
    const w2 = words[i + 1].replace(/^['-]|['-]$/g, "");
    if (w1.length > 2 && w2.length > 2 && !STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) {
      const bigram = `${w1} ${w2}`;
      bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
    }
  }
  const topBigrams = Object.entries(bigramFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Sentiment
  let positiveCount = 0;
  let negativeCount = 0;
  words.forEach((w) => {
    if (POSITIVE_WORDS.has(w)) positiveCount++;
    if (NEGATIVE_WORDS.has(w)) negativeCount++;
  });
  const totalSentimentWords = positiveCount + negativeCount || 1;
  const positiveRatio = Math.round((positiveCount / totalSentimentWords) * 100);
  const negativeRatio = Math.round((negativeCount / totalSentimentWords) * 100);
  const neutralRatio = Math.max(0, 100 - positiveRatio - negativeRatio);
  const overall: "positive" | "negative" | "neutral" =
    positiveCount > negativeCount * 1.2
      ? "positive"
      : negativeCount > positiveCount * 1.2
      ? "negative"
      : "neutral";

  // Per-page stats
  const pageStats: PageStats[] = pages.map((text, idx) => {
    const pw = text.split(/\s+/).filter((w) => w.length > 0);
    const ps = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    return {
      page: idx + 1,
      wordCount: pw.length,
      charCount: text.length,
      sentenceCount: ps.length,
    };
  });

  // Key topics (top words as topics, cleaned up)
  const keyTopics = topWords
    .slice(0, 8)
    .map((w) => w.word.charAt(0).toUpperCase() + w.word.slice(1));

  // Longest sentence
  const longestSentence = sentences.reduce(
    (a, b) => (b.split(" ").length > a.split(" ").length ? b : a),
    ""
  );

  // Summary (first 2 non-trivial sentences)
  const summarySentences = sentences
    .filter((s) => s.split(" ").length > 8)
    .slice(0, 2);
  const summary =
    summarySentences.join(". ") + (summarySentences.length ? "." : "No substantial text found.");

  const totalWords = words.length;
  const totalChars = fullText.replace(/\s/g, "").length;
  const avgSentenceLength = Math.round(totalWords / Math.max(sentences.length, 1));
  const readingTimeMinutes = Math.max(1, Math.round(totalWords / 238));
  const textDensity = Math.round((totalChars / Math.max(fullText.length, 1)) * 100);

  return {
    fileName,
    fileSize,
    totalPages: pages.length,
    totalWords,
    totalChars,
    totalSentences: sentences.length,
    totalParagraphs: paragraphs.length,
    avgWordsPerPage: Math.round(totalWords / Math.max(pages.length, 1)),
    avgSentenceLength,
    readingTimeMinutes,
    topWords,
    topBigrams,
    sentiment: {
      positive: positiveRatio,
      negative: negativeRatio,
      neutral: neutralRatio,
      overall,
    },
    pageStats,
    keyTopics,
    summary,
    textDensity,
    uniqueWords,
    vocabularyRichness,
    longestSentence: longestSentence.slice(0, 300),
    extractedText: fullText.slice(0, 2000),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
