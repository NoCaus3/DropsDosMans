import { NextResponse } from "next/server";
import { clearSessionCookie, readSession } from "@/lib/session";
import { softDeleteLink } from "@/lib/db";

export async function POST() {
  const session = await readSession();
  if (session) await softDeleteLink(session.sid);

  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`, 302);
  clearSessionCookie(res);
  return res;
}

export const GET = POST;
