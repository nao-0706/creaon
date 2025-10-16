"use client";
import apiFetch from "@/lib/fetcher";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["image", "audio", "video", "other"] as const;
type Type = (typeof TYPES)[number];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Type>("image");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needFile = type === "image" || type === "audio" || type === "video";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("タイトルは必須です");
    if (needFile && !file) return setError("このタイプではファイルが必須です");

    const fd = new FormData();
    fd.append("title", title);
    if (description) fd.append("description", description);
    fd.append("type", type);
    if (file) fd.append("media", file);

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/posts/", { method: "POST", body: fd, auth: true });
      if (!res.ok) throw new Error((await safeMessage(res)) || `投稿に失敗しました (${res.status})`);
      const data = await res.json();
      router.push(`/posts/${data.id}`);
    } catch (err: any) {
      setError(err.message ?? "投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">New Post</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title *</label>
          <input className="w-full rounded border bg-black/20 px-3 py-2" value={title}
                 onChange={(e) => setTitle(e.target.value)} placeholder="作品タイトル" />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full rounded border bg-black/20 px-3 py-2" rows={4}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="作品説明（任意）" />
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select className="rounded border bg-black/20 px-3 py-2" value={type}
                  onChange={(e) => setType(e.target.value as Type)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">image/audio/video のときはファイル必須</p>
        </div>
        <div>
          <label className="block text-sm mb-1">File {needFile ? "*" : "(任意)"}</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                 accept={type === "image" ? "image/*" : type === "audio" ? "audio/*" : type === "video" ? "video/*" : undefined} />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={submitting}
                className="rounded bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50">
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>
    </main>
  );
}

async function safeMessage(res: Response) {
  try { const data = await res.json(); return data?.detail || data?.error || ""; }
  catch { return ""; }
}
