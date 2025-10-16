"use client";

import { useState, useTransition } from "react";
import apiFetch from "@/lib/fetcher";

type Props = {
  postId: number;
  liked: boolean;        // APIの値をそのまま渡す
  likeCount: number;     // 同上
};

export default function LikeButton({ postId, liked, likeCount }: Props) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likeCount);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      // 楽観更新
      setIsLiked(v => !v);
      setCount(c => (isLiked ? c - 1 : c + 1));

      const method = isLiked ? "DELETE" : "POST";
      const res = await apiFetch(`/api/posts/${postId}/like/`, { method, auth: true });

      if (!res.ok) {
        // 失敗したら元に戻す
        setIsLiked(liked);
        setCount(likeCount);
        console.error("like failed", await res.text());
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-sm
                 border shadow-sm hover:shadow transition disabled:opacity-50"
      aria-pressed={isLiked}
    >
      <span className={isLiked ? "font-semibold" : ""}>{isLiked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
