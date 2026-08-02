import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("access_token"); 

  if (!token) {
    return NextResponse.json({ error: "Auth failed: No token received" }, { status: 400 });
  }

  const cookieStore = await cookies();
  // Save the user's agent token in a secure cookie
  cookieStore.set("prava_agent_token", token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Redirect back to the main dashboard
  return NextResponse.redirect(new URL("/", req.url));
}