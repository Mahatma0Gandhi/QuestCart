import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// --- THE SYSTEM PROMPT (The "Brain") ---
const PLANNER_SYSTEM_PROMPT = `
You are QuestCart's Procurement Planning Engine. 

Your mission: Convert a user's shopping goal into a structured, technical bill of materials.

RULES:
1. DECONSTRUCT: Break the goal into 5-10 logical technical categories.
2. SEARCH QUERIES: For every category, provide a "search_queries" array with ONE highly specific, searchable product model (e.g., "AMD Ryzen 5 7600" instead of "CPU").
3. BUDGET: Allocate the total budget across items. Ensure the sum matches the user's intent.
4. UNIQUE IDs: Every item MUST have a unique "id" (e.g., "item_01", "item_02"). This is critical for the UI.
5. CLARIFICATION: If the goal is impossible (e.g., "Tesla for $500"), set "clarification_needed" to true and explain why.

OUTPUT FORMAT (JSON ONLY):
{
  "clarification_needed": boolean,
  "clarification_question": "string or null",
  "mission": "Summary of the task",
  "budget": number,
  "procurement_plan": [
    { 
      "id": "item_unique_id", 
      "category": "e.g. Graphics Card", 
      "target_budget": number, 
      "search_queries": ["Specific Model Name"] 
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use gpt-4o for best reasoning
      messages: [
        { role: "system", content: PLANNER_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const plan = JSON.parse(content);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Planner Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}