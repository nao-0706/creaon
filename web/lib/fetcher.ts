import { getAccessToken, setAccessToken, clearAuth } from "./auth";

/**
 * アプリ共通のAPI呼び出し
 * - { auth: true } のとき Authorization ヘッダを付与
 * - 401 を受けたら /api/auth/refresh を叩いて access を更新 → 一度だけ再試行
 * - リフレッシュ失敗ならセッションをクリア
 */

type Opts = RequestInit & {
  auth?: boolean;           // 認証必須APIか
  baseURL?: string;         // 既定は NEXT_PUBLIC_API_BASE
  retryOn401?: boolean;     // 外から二重再試行させないためのフラグ
};

async function refreshAccess(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  // 成功時: { access: "..." } が返る想定
  if (!res.ok) return null;

  // JSONじゃないケースも安全に処理
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  const data = await res.json().catch(() => null);
  const access = data?.access;
  if (typeof access === "string" && access.length > 0) {
    setAccessToken(access);
    return access;
  }
  return null;
}

export async function apiFetch(path: string, init: Opts = {}) {
  const base = init.baseURL ?? process.env.NEXT_PUBLIC_API_BASE ?? "";
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = new Headers(init.headers || {});
  if (init.auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  }

  // 1回目のリクエスト
  let res = await fetch(url, { ...init, headers });

  // 401なら一度だけリフレッシュ→再試行
  if (init.auth && res.status === 401 && init.retryOn401 !== false) {
    const newAccess = await refreshAccess();
    if (!newAccess) {
      clearAuth(); // セッション破棄（必要ならここでログイン導線へ）
      return res;  // 元のレスポンス(401)を返す
    }
    headers.set("Authorization", `Bearer ${newAccess}`);
    res = await fetch(url, { ...init, headers, retryOn401: false });
  }

  return res;
}

/** JSONを直接返すヘルパ */
export async function apiJson<T = any>(path: string, init: Opts = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    // @ts-expect-error text も見たいとき用に投げる
    throw new Error(`Unexpected content-type: ${ct}`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("API Error"), { status: res.status, detail: err });
  }
  return res.json() as Promise<T>;
}
