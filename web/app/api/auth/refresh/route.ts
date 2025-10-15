
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refresh = req.cookies.get("refresh_token")?.value;
    if (!refresh) return NextResponse.json({ detail: "no refresh token" }, { status: 401 });

    const base = process.env.NEXT_PUBLIC_API_BASE;
    if (!base) return NextResponse.json({ detail: "NEXT_PUBLIC_API_BASE is not set" }, { status: 500 });

    const res = await fetch(`${base}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      // Djangoのエラーをそのまま見える形で返す
      return NextResponse.json(typeof payload === "string" ? { detail: payload } : payload, { status: res.status });
    }

    const next = NextResponse.json({ access: typeof payload === "string" ? "" : payload.access ?? "" });

    // ROTATE対応: refreshが返ってきたらCookie更新
    const newRefresh = typeof payload === "string" ? undefined : (payload as any).refresh;
    if (newRefresh) {
      next.cookies.set("refresh_token", newRefresh, {
        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
        path: "/", maxAge: 60 * 60 * 24 * 7,
      });
    }
    return next;
  } catch {
    return NextResponse.json({ detail: "unhandled error in /api/auth/refresh" }, { status: 500 });
  }
}
