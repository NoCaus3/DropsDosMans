import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { setStateCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL!;
  const state = crypto.randomBytes(24).toString("base64url");
  const returnTo = `${appUrl}/signin-steam?state=${state}`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": returnTo,
    "openid.realm": appUrl,
  });

  const res = NextResponse.redirect(
    `https://steamcommunity.com/openid/login?${params.toString()}`,
  );
  setStateCookie(res, "oauth_state_steam", state);
  return res;
}
