// web/app/posts/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../lib/api";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"image" | "audio" | "video" | "other">("other");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      if (!token) throw new Error("Not logged in");

      const fd = new FormData();
      fd.set("title", title);
      if (description) fd.set("description", description);
      fd.set("type", type);
      if (file) fd.set("media", file);

      const res = await fetch(`${API_BASE}/posts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create");
      }
      const created = await res.json();
      router.push(`/posts/${created.id}`);
    } catch (err: any) {
      setError(err.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Post</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={140}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="image">image</option>
            <option value="audio">audio</option>
            <option value="video">video</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Media (optional)</label>
          <input type="file" className="mt-1" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        {error && <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Create"}
        </button>
      </form>
    </main>
  );
}
