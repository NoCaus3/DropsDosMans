import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  signSession,
  setSessionCookie,
  clearStateCookie,
} from "@/lib/session";
import { upsertSteam } from "@/lib/db";
import { verifyOpenIdResponse, fetchSteamProfile } from "@/lib/steam";

function errorRedirect(reason: string) {
  return NextResponse.redirect(
    `${process.env.APP_URL}/connect?error=${reason}`,
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const stateCookie = req.cookies.get("oauth_state_steam")?.value;
  if (!state || state !== stateCookie) return errorRedirect("steam_state");

  const steamId = await verifyOpenIdResponse(url.searchParams);
  if (!steamId) return errorRedirect("steam_invalid");

  const profile = await fetchSteamProfile(steamId, process.env.STEAM_API_KEY!);

  const current = await readSession();
  const rowId = await upsertSteam(
    current?.sid ?? null,
    steamId,
    profile.persona,
    profile.avatar,
  );
  const jwt = await signSession({ sid: rowId });

  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`);
  setSessionCookie(res, jwt);
  clearStateCookie(res, "oauth_state_steam");
  return res;
}
