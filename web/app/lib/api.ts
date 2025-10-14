// web/app/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, cache: "no-store" });
  return res;
}
