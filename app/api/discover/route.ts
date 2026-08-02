import { NextResponse } from "next/server";

async function searchPrava(query: string, intent: string) {
  const apiKey = process.env.PRAVA_API_KEY;
  if (!apiKey) {
    console.error("Missing PRAVA_API_KEY");
    return [];
  }

  try {
    const res = await fetch("https://api.prava.space/v1/shop/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        intent: intent,
        limit: 3,
        ships_to: "IN",
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Support both singular 'item' (Popcorn loop) and 'query' (Direct call)
    const query = body.item?.search_queries?.[0] || body.item?.category || body.query;
    const mission = body.mission || body.intent || "Shopping Quest";

    if (!query) {
      return NextResponse.json({ error: "No search query found" }, { status: 400 });
    }

    const results = await searchPrava(query, mission);
    
    // Always return an object with a results array so the frontend doesn't crash
    return NextResponse.json({ results: results || [] });
  } catch (error: any) {
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }
}