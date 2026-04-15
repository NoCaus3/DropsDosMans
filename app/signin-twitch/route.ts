import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  signSession,
  setSessionCookie,
  clearStateCookie,
} from "@/lib/session";
import { upsertTwitch } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const stateCookie = req.cookies.get("oauth_state_twitch")?.value;

  if (!state || state !== stateCookie || !code) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=twitch_state`,
    );
  }

  const redirectUri = `${process.env.APP_URL}/signin-twitch`;
  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=twitch_token`,
    );
  }
  const tok = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const userRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${tok.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
    },
    cache: "no-store",
  });
  if (!userRes.ok) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=twitch_user`,
    );
  }
  const user = (await userRes.json()) as {
    data: Array<{
      id: string;
      login: string;
      display_name: string;
      email?: string;
    }>;
  };
  const u = user.data[0];
  if (!u) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/connect?error=twitch_user`,
    );
  }

  const current = await readSession();
  const rowId = await upsertTwitch(current?.sid ?? null, {
    id: u.id,
    login: u.login,
    display_name: u.display_name,
    email: u.email ?? null,
    access_token: tok.access_token,
    refresh_token: tok.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tok.expires_in,
  });

  const jwt = await signSession({ sid: rowId });
  const res = NextResponse.redirect(`${process.env.APP_URL}/connect`);
  setSessionCookie(res, jwt);
  clearStateCookie(res, "oauth_state_twitch");
  return res;
}
