import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  signSession,
  setSessionCookie,
  clearStateCookie,
} from "@/lib/session";
import { upsertTwitch } from "@/lib/db";
import { exchangeTwitchCode, fetchTwitchUser } from "@/lib/twitch";

function errorRedirect(reason: string) {
  return NextResponse.redirect(
    `${process.env.APP_URL}/connect?error=${reason}`,
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const stateCookie = req.cookies.get("oauth_state_twitch")?.value;
  if (!state || state !== stateCookie || !code) {
    return errorRedirect("twitch_state");
  }

  const clientId = process.env.TWITCH_CLIENT_ID!;
  const tokens = await exchangeTwitchCode({
    clientId,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    code,
    redirectUri: `${process.env.APP_URL}/signin-twitch`,
  });

  const user = await fetchTwitchUser({
    accessToken: tokens.access_token,
    clientId,
  });

  const current = await readSession();
  const rowId = await upsertTwitch(current?.sid ?? null, {
    id: user.id,
    login: user.login,
    display_name: user.display_name,
    email: user.email,
    avatar: user.profile_image_url,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
  });
  const jwt = await signSession({ sid: rowId });

  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`);
  setSessionCookie(res, jwt);
  clearStateCookie(res, "oauth_state_twitch");
  return res;
}
