// web/app/posts/[id]/page.tsx
import { apiFetch, API_BASE } from "../../lib/api";
type Post = {
  id: number;
  title: string;
  description: string;
  type: "image" | "audio" | "video" | "other";
  media: string | null;
  created_at: string;
};

function Media({ type, src }: { type: Post["type"]; src: string | null }) {
  if (!src) return null;
  const abs = src.startsWith("http") ? src : `${API_BASE}${src}`; // 相対→絶対に
  if (type === "image") return <img src={src} alt="" className="rounded border" />;
  if (type === "audio") return <audio controls src={src} className="w-full" />;
  if (type === "video") return <video controls src={src} className="w-full rounded border" />;
  return (
    <a href={src} className="text-blue-600 underline" target="_blank">
      Download
    </a>
  );
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const res = await apiFetch(`/posts/${params.id}/`);
  if (!res.ok) return <div className="p-6">Not found.</div>;
  const p: Post = await res.json();

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{p.title}</h1>
      <div className="text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
      <Media type={p.type} src={p.media} />
      {p.description && <p className="whitespace-pre-wrap">{p.description}</p>}
    </main>
  );
}
