// web/lib/auth.ts
const ACCESS_KEY = "access_token";

export function getAccessToken(): string | null {
  try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
}

export function setAccessToken(token: string | null) {
  try {
    if (token && token.length) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  } catch {}
}

export function clearAuth() {
  setAccessToken(null);
}

/** /api/auth/refresh を叩いて access を再発行し、保存して返す */
export async function refreshAccess(): Promise<string | null> {
  const r = await fetch("/api/auth/refresh", { method: "POST" });
  if (!r.ok) return null;

  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  const data: any = await r.json().catch(() => null);
  const access = data?.access;
  if (typeof access === "string" && access.length > 0) {
    setAccessToken(access);
    return access;
  }
  return null;
}
