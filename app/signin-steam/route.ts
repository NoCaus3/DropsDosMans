import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  signSession,
  setSessionCookie,
  clearStateCookie,
} from "@/lib/session";
import { upsertSteam } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const stateCookie = req.cookies.get("oauth_state_steam")?.value;

  if (!state || state !== stateCookie) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=steam_state`,
    );
  }

  // Verify OpenID response with Steam via check_authentication
  const verifyParams = new URLSearchParams();
  url.searchParams.forEach((v, k) => {
    if (k.startsWith("openid.")) verifyParams.set(k, v);
  });
  verifyParams.set("openid.mode", "check_authentication");

  const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });
  const verifyText = await verifyRes.text();
  if (!/is_valid\s*:\s*true/i.test(verifyText)) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=steam_invalid`,
    );
  }

  const claimedId = url.searchParams.get("openid.claimed_id") || "";
  const match = claimedId.match(/\/(?:id|openid\/id)\/(\d+)$/);
  if (!match) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=steam_claim`,
    );
  }
  const steamId = match[1];

  // Fetch player summary
  let persona: string | null = null;
  let avatar: string | null = null;
  try {
    const apiKey = process.env.STEAM_API_KEY!;
    const sumRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`,
      { cache: "no-store" },
    );
    const sum = await sumRes.json();
    const p = sum?.response?.players?.[0];
    if (p) {
      persona = p.personaname ?? null;
      avatar = p.avatarfull ?? null;
    }
  } catch {}

  const current = await readSession();
  const rowId = await upsertSteam(current?.sid ?? null, steamId, persona, avatar);
  const jwt = await signSession({ sid: rowId });

  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`);
  setSessionCookie(res, jwt);
  clearStateCookie(res, "oauth_state_steam");
  return res;
}
