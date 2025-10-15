// web/app/posts/[id]/page.tsx
import { apiFetch, API_BASE } from "../../lib/api";
import LikeButton from "@/components/LikeButton";
// import { apiJson } from "@/lib/fetcher"; // 使ってなければ消してOK

type Post = {
  id: number;
  title: string;
  description: string;
  type: "image" | "audio" | "video" | "other";
  media: string | null;
  created_at: string;
  like_count: number;
  liked: boolean;
};

function Media({ type, src }: { type: Post["type"]; src: string | null }) {
  if (!src) return null;
  const abs = src.startsWith("http") ? src : `${API_BASE}${src}`; // 相対→絶対
  if (type === "image") return <img src={abs} alt="" className="rounded border" />;
  if (type === "audio") return <audio controls src={abs} className="w-full" />;
  if (type === "video") return <video controls src={abs} className="w-full rounded border" />;
  return (
    <a href={abs} className="text-blue-600 underline" target="_blank">
      Download
    </a>
  );
}

// ★ Next.js 15: params は Promise。await してから id を使う
export default async function PostDetail(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await apiFetch(`/api/posts/${id}/`);
  if (!res.ok) return <div className="p-6">Not found.</div>;
  const p: Post = await res.json();

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      {/* タイトル行：左タイトル / 右♡ボタン */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{p.title}</h1>
        {/* NaN/undefined防止でキャスト */}
        <LikeButton
          postId={p.id}
          liked={!!p.liked}
          likeCount={Number.isFinite(p.like_count as any) ? Number(p.like_count) : 0}
        />
      </div>

      <div className="text-gray-500">{new Date(p.created_at).toLocaleString()}</div>

      <Media type={p.type} src={p.media} />

      {p.description && <p className="whitespace-pre-wrap">{p.description}</p>}
    </main>
  );
}
