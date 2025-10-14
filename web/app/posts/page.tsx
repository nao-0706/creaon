// web/app/posts/page.tsx
import Link from "next/link";
import { apiFetch } from "../lib/api";

type Post = {
  id: number;
  title: string;
  type: "image" | "audio" | "video" | "other";
  created_at: string;
};

export default async function PostsPage() {
  const res = await apiFetch("/posts/");
  if (!res.ok) return <div className="p-6">Failed to load.</div>;
  const data: Post[] = await res.json();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/posts/new" className="px-3 py-2 rounded bg-black text-white">
          New
        </Link>
      </div>

      <ul className="divide-y border rounded">
        {data.map((p) => (
          <li key={p.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
            <div>
              <Link href={`/posts/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <div className="text-sm text-gray-500">type: {p.type}</div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(p.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {data.length === 0 && <li className="p-4 text-gray-500">No posts yet.</li>}
      </ul>
    </main>
  );
}
