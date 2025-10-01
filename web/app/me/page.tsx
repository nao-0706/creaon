// web/app/me/page.tsx
"use client";

import { useEffect, useState } from "react";

type Me = {
  id: number;
  username: string;
  email: string;
  role: "viewer" | "artist" | "admin";
  bio?: string;
};

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchMe() {
    setLoading(true);
    setError(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_BASE;
      const access = localStorage.getItem("access"); // サインアップ/ログイン時に保存済み

      if (!access) {
        setError("未ログインです。まず /signup か /login で取得してください。");
        return;
      }

      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(`エラー: ${res.status} ${JSON.stringify(body)}`);
        return;
      }

      const data: Me = await res.json();
      setMe(data);
    } catch (e: any) {
      setError(`通信エラー: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  // 初回表示時に自動取得（必要なら手動ボタンだけにしてもOK）
  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">My profile</h1>

        <button
          onClick={fetchMe}
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "取得中..." : "情報を再取得"}
        </button>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        {me && (
          <div className="text-sm space-y-2">
            <p><span className="font-semibold">ID:</span> {me.id}</p>
            <p><span className="font-semibold">Username:</span> {me.username}</p>
            <p><span className="font-semibold">Email:</span> {me.email}</p>
            <p><span className="font-semibold">Role:</span> {me.role}</p>
            {me.bio && <p><span className="font-semibold">Bio:</span> {me.bio}</p>}
          </div>
        )}

        <p className="text-center text-xs text-gray-500">
          取得先: {process.env.NEXT_PUBLIC_API_BASE}/users/me
        </p>
      </div>
    </main>
  );
}
