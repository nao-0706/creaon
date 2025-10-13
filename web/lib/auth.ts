/**
 * Access token storage utilities
 * - access は localStorage に保存（クライアントのみ）
 * - SSR時は常に null を返す
 */

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

export const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem("access_token", token);
    } else {
      window.localStorage.removeItem("access_token");
    }
  } catch {
    // silent
  }
};

export const clearAuth = () => {
  setAccessToken(null);
};