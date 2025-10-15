// web/lib/fetcher.ts
import { getAccessToken, setAccessToken, clearAuth, refreshAccess } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type Opts = RequestInit & {
  auth?: boolean;     // 認証必須APIなら true
  baseURL?: string;   // 既定は NEXT_PUBLIC_API_BASE
  retryOn401?: boolean; // 内部用: 二重再試行防止フラグ
};

export async function apiFetch(path: string, opts: Opts = {}) {
  const base = opts.baseURL ?? API_BASE;
  const url = path.startsWith("http") ? path : `${base}${path}`;

  // ヘッダ整形
  const headers = new Headers(opts.headers as any);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // 認証が必要なら Authorization 付与
  if (opts.auth) {
    const t = getAccessToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  let res = await fetch(url, { ...opts, headers });

  // 401/403 は「未認証」扱い → access を再発行して 1 回だけ再試行
  if (opts.auth && (res.status === 401 || res.status === 403) && !opts.retryOn401) {
    const t2 = await refreshAccess();
    if (t2) {
      headers.set("Authorization", `Bearer ${t2}`);
      res = await fetch(url, { ...opts, headers, retryOn401: true });
    }
  }

  return res;
}
