// web/app/posts/page.tsx
import Link from "next/link";
import apiFetch, { API_BASE } from "@/lib/fetcher";
// （任意）いいねボタン有効化
// import LikeButton from "@/components/LikeButton";

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

function MediaThumb({ type, src }: { type: Post["type"]; src: string | null }) {
  if (!src) return null;
  const abs = src.startsWith("http") ? src : `${API_BASE}${src}`;

  if (type === "image") {
    return <img src={abs} alt="" className="w-full h-48 object-cover rounded" />;
  }
  if (type === "video") {
    return <video src={abs} className="w-full h-48 rounded" muted />;
  }
  if (type === "audio") {
    return <div className="p-3 text-sm text-gray-500">🔈 Audio</div>;
  }
  return <div className="p-3 text-sm text-gray-500">📄 File</div>;
}

export default async function PostsPage() {
  const res = await apiFetch("/api/posts/");
  if (!res.ok) {
    return <div className="p-6">Failed to load.</div>;
  }
  const posts: Post[] = await res.json();

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Posts</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <article
            key={p.id}
            className="block border rounded-lg overflow-hidden hover:shadow transition"
          >
            <MediaThumb type={p.type} src={p.media} />

            <div className="p-3 space-y-2">
              <h2 className="font-semibold line-clamp-1">{p.title}</h2>
              <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <time>{new Date(p.created_at).toLocaleString()}</time>
                {/* （任意）いいねボタンを使う場合はコメント解除
                <LikeButton postId={p.id} liked={p.liked} likeCount={p.like_count} />
                */}
                <span>♥ {p.like_count}</span>
              </div>

              <div className="pt-2">
                <Link href={`/posts/${p.id}`} className="text-sm underline">
                  Open
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
