import { NextResponse } from "next/server";

// Simple logout endpoint. The frontend clears its own auth token (JWT)
// from localStorage; there is no server-side session to invalidate.
export async function POST() {
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
