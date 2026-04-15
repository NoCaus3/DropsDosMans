const OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const SUMMARIES_ENDPOINT =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

export function buildSteamLoginUrl(params: {
  returnTo: string;
  realm: string;
}) {
  const q = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": params.returnTo,
    "openid.realm": params.realm,
  });
  return `${OPENID_ENDPOINT}?${q.toString()}`;
}

export async function verifyOpenIdResponse(
  searchParams: URLSearchParams,
): Promise<string | null> {
  const body = new URLSearchParams();
  searchParams.forEach((v, k) => {
    if (k.startsWith("openid.")) body.set(k, v);
  });
  body.set("openid.mode", "check_authentication");

  const res = await fetch(OPENID_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!/is_valid\s*:\s*true/i.test(text)) return null;

  const claimedId = searchParams.get("openid.claimed_id") ?? "";
  const match = claimedId.match(/\/(?:id|openid\/id)\/(\d+)$/);
  return match ? match[1] : null;
}

export type SteamProfile = {
  persona: string | null;
  avatar: string | null;
};

export async function fetchSteamProfile(
  steamId: string,
  apiKey: string,
): Promise<SteamProfile> {
  const url = `${SUMMARIES_ENDPOINT}?key=${apiKey}&steamids=${steamId}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { persona: null, avatar: null };
  const data = (await res.json()) as {
    response?: { players?: Array<{ personaname?: string; avatarfull?: string }> };
  };
  const player = data.response?.players?.[0];
  return {
    persona: player?.personaname ?? null,
    avatar: player?.avatarfull ?? null,
  };
}
