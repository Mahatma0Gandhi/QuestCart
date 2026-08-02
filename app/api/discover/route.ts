import { NextResponse } from "next/server";

// INLINED FUNCTION: Bypasses the "Module Not Found" error
async function searchPrava(query: string, intent: string) {
  const apiKey = process.env.PRAVA_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.prava.space/v1/shop/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        intent,
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
    const { plan, mission } = await req.json();
    
    if (!plan || !Array.isArray(plan)) {
      return NextResponse.json({ error: "No plan provided" }, { status: 400 });
    }

    const discoveryResults = await Promise.all(
      plan.map(async (item: any) => {
        const query = item.search_queries?.[0] || item.category;
        const products = await searchPrava(query, mission || "Shopping");
        return { ...item, products };
      })
    );

    return NextResponse.json(discoveryResults);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}