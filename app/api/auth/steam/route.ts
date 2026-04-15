import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { setStateCookie } from "@/lib/session";
import { buildSteamLoginUrl } from "@/lib/steam";

export async function GET() {
  const appUrl = process.env.APP_URL!;
  const state = crypto.randomBytes(24).toString("base64url");
  const loginUrl = buildSteamLoginUrl({
    returnTo: `${appUrl}/signin-steam?state=${state}`,
    realm: appUrl,
  });

  const res = NextResponse.redirect(loginUrl);
  setStateCookie(res, "oauth_state_steam", state);
  return res;
}
