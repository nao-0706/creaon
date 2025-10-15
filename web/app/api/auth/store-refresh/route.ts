import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { refresh } = await req.json();
    if (!refresh || typeof refresh !== "string") {
      return NextResponse.json({ detail: "refresh token required" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });

    // 7日（秒）
    const maxAge = 60 * 60 * 24 * 7;

    // 本番では secure: true（HTTPSのみ）。ローカルHTTPでは false に落とす。
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,     // dev(HTTP)で動かすなら false、Vercel/本番は true
      path: "/",
      maxAge,
    });

    return res;
  } catch {
    return NextResponse.json({ detail: "invalid payload" }, { status: 400 });
  }
}