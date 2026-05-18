import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rawText, authorName, authorRole, audioUrl } = body;

  // Handle audio transcription
  if (audioUrl) {
    // Audio transcription requires manual input or browser speech recognition
    // This is a known limitation — for now, encourage keeping the audio file
    return NextResponse.json({
      error: "תמלול אוטומטי אינו זמין כעת. אנא בחרו 'שמור כקובץ' כדי לשמור את ההקלטה.",
    }, { status: 501 });
  }

  // Handle text improvement
  if (!rawText?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (!client) {
    // No API key — return original unchanged
    return NextResponse.json({ improvedText: rawText, changed: false });
  }

  const prompt = `You are editing spoken or written family travel memories for the Ergas family's Thailand journey journal.

Author: ${authorName ?? "משפחה"} (${authorRole ?? ""})

Rules:
- Preserve the original voice and personality completely
- Keep it natural and human — never make it sound like a blog post or AI
- Remove filler words only when they hurt readability
- Keep children's speech authentic and childlike — do NOT make it more adult
- Fix obvious grammar errors only if they break comprehension
- Keep emotional tone, humor, and specific details intact
- Do not add information that wasn't in the original
- Output only the improved text — no explanations, no quotes around it
- If the text is already good, return it with minimal or no changes
- Keep Hebrew text in Hebrew

Original text:
${rawText}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const improvedText =
      message.content[0].type === "text" ? message.content[0].text.trim() : rawText;

    return NextResponse.json({ improvedText, changed: improvedText !== rawText });
  } catch (err) {
    console.error("Claude improve error:", err);
    return NextResponse.json({ improvedText: rawText, changed: false });
  }
}
