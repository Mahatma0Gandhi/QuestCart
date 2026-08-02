import { NextResponse } from "next/server";
import { PravaAdapter } from "@/lib/prava/PravaAdapter";

export async function POST() {
  try {
    const adapter = new PravaAdapter("user_default");
    const result = await adapter.poll();
    return NextResponse.json(result);
  } catch (e: any) {
    // If it's a timeout or warning, check status again
    const adapter = new PravaAdapter("user_default");
    const check = await adapter.status();
    return NextResponse.json({ linked: check.linked });
  }
}