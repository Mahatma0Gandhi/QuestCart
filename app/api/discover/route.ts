import { NextResponse } from "next/server";
import { searchPrava } from "@/lib/prava";

export async function POST(req: Request) {
  try {
    const { plan, mission } = await req.json();

    if (!plan || !Array.isArray(plan)) {
      return NextResponse.json({ error: "Invalid plan format" }, { status: 400 });
    }

    // Process each category in the plan
    const discoveryResults = await Promise.all(
      plan.map(async (item: any) => {
        // Use the first suggested search query from the planner
        // If search_queries is missing, fallback to category name
        const query = item.search_queries?.[0] || item.category;
        
        const products = await searchPrava(query, mission || "Shopping Request");
        
        return {
          ...item,
          products // These are the real products from Prava
        };
      })
    );

    return NextResponse.json(discoveryResults);
  } catch (error: any) {
    console.error("Discovery Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}