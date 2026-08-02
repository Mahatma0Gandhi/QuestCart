import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("access_token"); // Prava sends the token here

  if (token) {
    const cookieStore = await cookies();
    cookieStore.set("prava_token", token, { httpOnly: true, secure: true });
  }

  return NextResponse.redirect("/"); // Go back to the dashboard
}