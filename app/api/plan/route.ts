import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// --- THE BRAIN OF QUESTCART ---
const PLANNER_SYSTEM_PROMPT = `
You are QuestCart's planning engine. 
Your job is to convert a user's shopping goal into a structured procurement plan.

RULES:
1. DECONSTRUCT: Break the goal into logical technical categories.
2. SPECIFICITY: For every category, provide a "search_queries" array. 
   - DO NOT use generic terms like "GPU" or "Tools".
   - USE specific searchable nouns or models like "RTX 4060 Ti 16GB" or "Japanese Ryoba Pull Saw".
   - These queries must fit the target_budget for that category.
3. CLARIFICATION: If the budget or specific use-case is missing, set "clarification_needed" to true and ask a question.
4. JSON ONLY: Return ONLY a valid JSON object.

JSON STRUCTURE:
{
  "clarification_needed": boolean,
  "clarification_question": "string or null",
  "mission": "string",
  "budget": number,
  "procurement_plan": [
    { 
      "id": "unique_string_1", 
      "category": "string", 
      "target_budget": number, 
      "search_queries": ["specific model 1", "specific model 2"] 
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No goal provided" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PLANNER_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("OpenAI returned empty content");

    const plan = JSON.parse(content);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Planner Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}