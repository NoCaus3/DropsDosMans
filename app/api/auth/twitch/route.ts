import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { setStateCookie } from "@/lib/session";
import { buildTwitchAuthUrl } from "@/lib/twitch";

export async function GET() {
  const appUrl = process.env.APP_URL!;
  const state = crypto.randomBytes(24).toString("base64url");
  const authUrl = buildTwitchAuthUrl({
    clientId: process.env.TWITCH_CLIENT_ID!,
    redirectUri: `${appUrl}/signin-twitch`,
    state,
  });

  const res = NextResponse.redirect(authUrl);
  setStateCookie(res, "oauth_state_twitch", state);
  return res;
}
