import { NextResponse } from "next/server";
import { searchPrava } from "@/lib/prava";

export async function POST(req: Request) {
  const { plan, mission } = await req.json();

  // Run all Prava searches in parallel for speed
  const discoveredPlan = await Promise.all(
    plan.map(async (item: any) => {
      // We search for the first query suggested by the Planner
      const products = await searchPrava(item.search_queries[0], mission);
      return { ...item, products };
    })
  );

  return NextResponse.json(discoveredPlan);
}