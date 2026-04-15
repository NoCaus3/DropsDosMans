import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`, 302);
  clearSessionCookie(res);
  return res;
}

export const GET = POST;
