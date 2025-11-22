"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AddPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<any | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    if (!title || !topic || !content) {
      alert("Please fill all fields");
      return;
    }
    // generate id with fallback
    let id: string;
    try {
      id =
        typeof nanoid === "function"
          ? nanoid(8)
          : Date.now().toString(36).slice(-8);
    } catch (e) {
      id = Date.now().toString(36).slice(-8);
    }

    try {
      // include owner from localStorage (client-side auth)
      let ownerId: string | null = null;
      try {
        const u = localStorage.getItem("clarifynet_user");
        if (u) ownerId = JSON.parse(u).id;
      } catch (e) {}

      const resp = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          topic: topic.toLowerCase(),
          content,
          video_url: videoUrl || null,
          owner: ownerId,
        }),
      });

      const json = await resp.json();
      if (!resp.ok || json?.error) {
        console.error("API insert failed", json);
        alert("Error saving post");
        return;
      }

      const inserted = json.data;
      router.push(`/p/${inserted.id}`);
    } catch (err) {
      console.error("Unexpected error inserting post", err);
      alert("Error saving post");
    }
  };

  const fetchOEmbed = async (url: string) => {
    if (!url) return;
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`;
      const res = await fetch(oembedUrl);
      if (!res.ok) return;
      const data = await res.json();
      setVideoPreview(data);
      if (!title) setTitle(data.title || "");
    } catch (err) {
      console.warn("oEmbed fetch failed", err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Add Knowledge</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 w-full rounded"
        />

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic (e.g., Algebra)"
          className="border p-2 w-full rounded"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the knowledge here..."
          className="border p-2 w-full h-40 rounded"
        />

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onBlur={() => fetchOEmbed(videoUrl)}
          placeholder="Optional video URL (YouTube)"
          className="border p-2 w-full rounded"
        />

        {videoPreview ? (
          <div className="flex items-center gap-4">
            <img
              src={videoPreview?.thumbnail_url}
              alt="thumb"
              className="w-36 h-20 object-cover"
            />
            <div>
              <div className="font-semibold">{videoPreview?.title}</div>
              <div className="text-sm text-gray-500">
                {videoPreview?.author_name}
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Publish
        </button>
      </div>
    </ErrorBoundary>
  );
}
