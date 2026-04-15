import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { enableDrops, getLinkById } from "@/lib/db";

export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.redirect(`${process.env.APP_URL}/connect`, 302);
  }
  const row = await getLinkById(session.sid);
  if (row && row.steam_id && row.twitch_id) {
    await enableDrops(session.sid);
  }
  return NextResponse.redirect(`${process.env.APP_URL}/connect`, 302);
}

export const GET = POST;
