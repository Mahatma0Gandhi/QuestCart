import { NextResponse } from "next/server";
import OpenAI from "openai";

const PLANNER_SYSTEM_PROMPT = `
You are QuestCart's planning engine. 
Convert the user's shopping goal into a structured procurement plan JSON.

If info is missing (budget, etc.), set clarification_needed: true.
Otherwise, set clarification_needed: false and provide a mission and procurement_plan.

JSON Structure:
{
  "clarification_needed": boolean,
  "clarification_question": string,
  "mission": string,
  "budget": number,
  "procurement_plan": [
    { "category": string, "priority": "required" | "recommended", "target_budget": number, "selection_criteria": string[] }
  ]
}

DO NOT name brands. Return ONLY valid JSON.
`;

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4o-mini"
      messages: [
        { role: "system", content: PLANNER_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" }, // Forces JSON output
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");

    const plan = JSON.parse(content);
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Planner Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}