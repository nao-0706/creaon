// web/app/me/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// …（既存の Me 型に bio はもう含まれているのでそのままOK）…

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linksText, setLinksText] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  }

  // 🔴 追加：bioの編集用テキスト＆保存中フラグ
  const [bioText, setBioText] = useState<string>("");        // 🔴
  const [savingBio, setSavingBio] = useState(false);          // 🔴

  async function fetchMe() {
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE;
      const access = localStorage.getItem("access");
      if (!access) { setError("未ログインです。まず /signup か /login で取得してください。"); return; }

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
      setLinksText(JSON.stringify(data.links ?? {}, null, 2));
      setBioText(data.bio ?? "");                            // 🔴 取得したbioを編集欄へ
    } catch (e: any) {
      setError(`通信エラー: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  // 🔴 追加：bio を PATCH で保存
  async function saveBio() {
    setSavingBio(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE;
      const access = localStorage.getItem("access");
      if (!access) { setError("未ログインです。まず /signup か /login で取得してください。"); return; }

      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ bio: bioText }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(`保存エラー: ${res.status} ${JSON.stringify(body)}`);
        return;
      }

      const updated: Me = await res.json();
      setMe(updated);
      setBioText(updated.bio ?? "");                         // 🔴 サーバ反映で整える
    } catch (e: any) {
      setError(`通信エラー: ${e?.message ?? e}`);
    } finally {
      setSavingBio(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">My profile</h1>

        <button
          onClick={logout}
          className="w-full rounded-xl bg-gray-700 text-white py-2"
        >
          ログアウト
        </button>

        <button
          onClick={fetchMe}
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "取得中..." : "情報を再取得"}
        </button>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        {me && (
          <div className="text-sm space-y-3">
            <p><span className="font-semibold">ID:</span> {me.id}</p>
            <p><span className="font-semibold">Username:</span> {me.username}</p>
            <p><span className="font-semibold">Email:</span> {me.email}</p>
            <p><span className="font-semibold">Role:</span> {me.role}</p>

            {/* 🔴 追加：bio 編集UI */}
            <div className="space-y-2">
              <label className="font-semibold">Bio</label>
              <textarea
                className="w-full h-24 rounded border p-2"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="自己紹介を入力してください"
              />
              <button
                onClick={saveBio}
                disabled={savingBio}
                className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
              >
                {savingBio ? "保存中..." : "bio を保存"}
              </button>
            </div>

            {/* 既存の links 編集UI はそのまま */}
            <div className="space-y-2">
              <label className="font-semibold">Links (JSON)</label>
              <textarea
                className="w-full h-40 rounded border p-2 font-mono text-xs"
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                placeholder='例: {"instagram":"https://instagram.com/your_id"}'
              />
              <button
                onClick={saveLinks}
                disabled={saving}
                className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
              >
                {saving ? "保存中..." : "links を保存"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500">
          取得先: {process.env.NEXT_PUBLIC_API_BASE}/users/me
        </p>
      </div>
    </main>
  );
}
