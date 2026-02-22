import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt in request body." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const model = "models/gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        // Force JSON output mode — prevents markdown wrapping
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.json();
      const msg = err?.error?.message || `Gemini API error ${response.status}`;
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      const reason = data?.candidates?.[0]?.finishReason || "unknown";
      return NextResponse.json(
        { error: `Gemini returned empty response. Finish reason: ${reason}` },
        { status: 500 }
      );
    }

    // Return raw text — let the client parse it
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
