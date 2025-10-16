import { getAccessToken, setAccessToken, clearAuth, refreshAccess } from "./auth";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type Opts = RequestInit & {
  auth?: boolean;
  baseURL?: string;
  retryOn401?: boolean;
};

export default async function apiFetch(path: string, opts: Opts = {}) {
  const base = opts.baseURL ?? API_BASE;
  const url = path.startsWith("http") ? path : `${base}${path}`;
  console.log("[apiFetch] ->", url);
  const headers = new Headers(opts.headers as any);
  const isForm = (typeof FormData !== "undefined") && (opts.body instanceof FormData);
  const isBlob  = (typeof Blob !== "undefined") && (opts.body instanceof Blob);

  if (isForm || isBlob) {
    headers.delete("Content-Type");   // 念のため消す
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (opts.auth) {
    const t = getAccessToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  let res = await fetch(url, { ...opts, headers, cache: "no-store" });

  if (opts.auth && (res.status === 401 || res.status === 403) && !opts.retryOn401) {
    const t2 = await refreshAccess();
    if (t2) {
      headers.set("Authorization", `Bearer ${t2}`);
      // @ts-ignore  ← この行の直前に置く
      res = await fetch(url, { ...opts, headers, cache: "no-store", retryOn401: true });
    }
  }

  return res;
}
