import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(`${process.env.APP_URL}/connect`, 302);
}

export const GET = POST;
