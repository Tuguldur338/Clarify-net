"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data;
        setPost(d);
        setTitle(d?.title || "");
        setTopic(d?.topic || "");
        setContent(d?.content || "");
        setVideoUrl(d?.video_url || "");
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  const handleSave = async () => {
    setError(null);
    try {
      const u = localStorage.getItem("clarifynet_user");
      const owner = u ? JSON.parse(u).id : null;
      const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          topic,
          content,
          video_url: videoUrl || null,
          owner,
        }),
      });
      const j = await res.json();
      if (!res.ok || j?.error) {
        setError(j?.error || "Save failed");
        return;
      }
      router.push(`/p/${id}`);
    } catch (e) {
      setError(String(e));
    }
  };

  if (error) return <div className="p-6">Error: {error}</div>;
  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Knowledge</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 w-full h-40 rounded"
      />
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={() => router.push(`/p/${id}`)}
          className="bg-gray-100 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
