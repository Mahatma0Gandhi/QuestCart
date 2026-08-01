import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ProcurementPlanSchema } from "@/types/planner";
import { zodResponseFormat } from "openai/helpers/zod";

// --- THE SYSTEM PROMPT ---
const PLANNER_SYSTEM_PROMPT = `
You are QuestCart's planning engine.

Your job is NOT to search products.
Your job is to convert a user's shopping goal into a structured procurement plan.

If information is missing (like budget, location, or specific use-case), set "clarification_needed" to true and ask a question.

If sufficient information exists:
1. Set "clarification_needed" to false.
2. Define the "mission".
3. Allocate the "budget" across logical categories.
4. For each category, define "selection_criteria" (technical specs, not brands).

Never invent specific products or brands. 
Return ONLY valid JSON.
`;

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: PLANNER_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: zodResponseFormat(ProcurementPlanSchema, "plan"),
    });

    const plan = completion.choices[0].message.parsed;
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Planner Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate plan" }, { status: 500 });
  }
}