import { NextResponse } from "next/server";
import { callPravaTool } from "@/lib/prava-mcp";

export async function POST(req: Request) {
  try {
    const { item } = await req.json();
    const query = item.search_queries?.[0] || item.category;

    console.log(`QUEST_LOG: Executing MCP shop_search for: ${query}`);

    // Call the exact same tool the CLI uses
    const mcpResponse = await callPravaTool("shop_search", { 
      query: query
    });

    // Extract the products from the MCP response content
    // Note: MCP Tool responses are usually text or JSON inside a content array
    let products = [];
    if (mcpResponse.content && mcpResponse.content[0]) {
        try {
            const parsed = JSON.parse(mcpResponse.content[0].text);
            products = parsed.results || [];
        } catch (e) {
            console.error("Failed to parse MCP response", e);
        }
    }

    return NextResponse.json({ 
        ...item, 
        results: products 
    });
  } catch (error: any) {
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }
}