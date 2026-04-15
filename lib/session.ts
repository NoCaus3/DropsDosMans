import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export type SessionPayload = {
  sid: number;
};

export async function signSession(payload: SessionPayload) {
  return await new SignJWT({ sid: payload.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sid !== "number") return null;
    return { sid: payload.sid };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, jwt: string) {
  const secure = process.env.NODE_ENV === "production";
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=${jwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(res: Response) {
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

export function setStateCookie(res: Response, name: string, value: string) {
  const secure = process.env.NODE_ENV === "production";
  res.headers.append(
    "Set-Cookie",
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure ? "; Secure" : ""}`,
  );
}

export function clearStateCookie(res: Response, name: string) {
  res.headers.append(
    "Set-Cookie",
    `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}
