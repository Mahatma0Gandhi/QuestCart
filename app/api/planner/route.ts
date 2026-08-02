import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const { goal } = await req.json();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a shopping planner. Break down the user goal into a procurement plan JSON including categories, target budgets, and specific search nouns. No specific brands unless necessary." },
      { role: "user", content: goal }
    ],
    response_format: { type: "json_object" }
  });
  return NextResponse.json(JSON.parse(completion.choices[0].message.content!));
}