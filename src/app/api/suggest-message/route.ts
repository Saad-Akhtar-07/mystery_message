import { NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

const SYSTEM_PROMPT = `
Create exactly 3 open-ended and engaging questions formatted as a single string.
Separate each question using "||".

These questions are for an anonymous social messaging platform like Qooh.me.

Rules:
- friendly
- safe
- non-sensitive
- curiosity-driven
- universal topics
- positive tone

Example:
What's a hobby you've recently started?||
If you could meet any historical figure, who would it be?||
What's a small thing that makes you happy?
`;

async function generateSuggestions() {
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt: "Generate 3 engaging anonymous message suggestions.",
    temperature: 0.8,
    maxOutputTokens: 300,
  });

  const suggestions = text
    .trim()
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!suggestions.length) {
    throw new Error("No valid suggestions generated");
  }

  return {
    suggestions,
    raw: text,
  };
}

export async function GET() {
  try {
    const data = await generateSuggestions();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate suggestions",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}