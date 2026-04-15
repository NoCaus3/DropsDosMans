import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { setStateCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL!;
  const state = crypto.randomBytes(24).toString("base64url");
  const redirectUri = `${appUrl}/signin-twitch`;

  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user:read:email",
    state,
    force_verify: "true",
  });

  const res = NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params.toString()}`,
  );
  setStateCookie(res, "oauth_state_twitch", state);
  return res;
}
