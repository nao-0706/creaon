// web/app/signup/page.tsx
"use client";

import { useState } from "react";

export default function SignupPage() {
  // 入力の状態を持つ
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // 送信の状態/結果表示
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 送信ハンドラ
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_BASE; // 例: http://127.0.0.1:8000

      const res = await fetch(`${API}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        // バリデーションエラーなどを表示
        const err = await res.json().catch(() => ({}));
        setMessage(`エラー: ${res.status} ${JSON.stringify(err)}`);
        return;
      }

      const data = await res.json(); // { user, access, refresh }
      // デモ用：トークンをローカルに保存（MVPなので簡易に）
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setMessage(`登録OK: ${data.user.username}（ID: ${data.user.id}）`);
      // TODO: ここで /me へ遷移するなど
    } catch (e: any) {
      setMessage(`通信エラー: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign up</h1>

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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "送信中..." : "登録する"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center whitespace-pre-wrap">{message}</p>
        )}

        <p className="text-center text-sm text-gray-500">
          送信先: {process.env.NEXT_PUBLIC_API_BASE}/users/
        </p>
      </div>
    </main>
  );
}
