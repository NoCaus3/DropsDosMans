const AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const USERS_URL = "https://api.twitch.tv/helix/users";

export const TWITCH_SCOPES = ["user:read:email"];

export function buildTwitchAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const q = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: TWITCH_SCOPES.join(" "),
    state: params.state,
    force_verify: "true",
  });
  return `${AUTHORIZE_URL}?${q.toString()}`;
}

export type TwitchTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function exchangeTwitchCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<TwitchTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      code: params.code,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Twitch token exchange failed: ${res.status}`);
  return (await res.json()) as TwitchTokens;
}

export async function refreshTwitchToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TwitchTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: "refresh_token",
      refresh_token: params.refreshToken,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Twitch token refresh failed: ${res.status}`);
  return (await res.json()) as TwitchTokens;
}

export type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  email: string | null;
  profile_image_url: string | null;
};

export async function fetchTwitchUser(params: {
  accessToken: string;
  clientId: string;
}): Promise<TwitchUser> {
  const res = await fetch(USERS_URL, {
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Client-Id": params.clientId,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Twitch user fetch failed: ${res.status}`);
  const data = (await res.json()) as {
    data: Array<{
      id: string;
      login: string;
      display_name: string;
      email?: string;
      profile_image_url?: string;
    }>;
  };
  const user = data.data[0];
  if (!user) throw new Error("Twitch user not found in response");
  return {
    id: user.id,
    login: user.login,
    display_name: user.display_name,
    email: user.email ?? null,
    profile_image_url: user.profile_image_url ?? null,
  };
}
