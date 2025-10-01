// web/app/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  // 入力欄の状態（値の入れ物）
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 送信中やメッセージ表示に使う状態
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // フォーム送信時の処理
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();            // 画面がリロードされるのを防止
    setLoading(true);
    setMessage(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_BASE; // 例: http://127.0.0.1:8000

      // SimpleJWT: POST /auth/jwt/create に { username, password } を送る
      const res = await fetch(`${API}/auth/jwt/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage(`エラー: ${res.status} ${JSON.stringify(body)}`);
        return;
        // 例: {"detail":"No active account found with the given credentials"}
      }

      const data = await res.json(); // { refresh, access }
      // MVPでは localStorage に保存（本番はHttpOnly Cookieに移行予定）
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setMessage("ログイン成功！ /me ページでプロフィールを確認できます。");
      // TODO: 成功後に自動遷移するなら router.push("/me") を使う
    } catch (e: any) {
      setMessage(`通信エラー: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Log in</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded border p-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full rounded border p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
          >
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center whitespace-pre-wrap">{message}</p>
        )}

        <p className="text-center text-xs text-gray-500">
          送信先: {process.env.NEXT_PUBLIC_API_BASE}/auth/jwt/create
        </p>
      </div>
    </main>
  );
}
