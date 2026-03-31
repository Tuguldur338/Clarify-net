"use client";

import { useState, useRef } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AddPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Fun");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Valid main subjects only
  const validSubjects = [
    "math",
    "science",
    "english",
    "history",
    "pe",
    "computer science",
    "programming",
    "biology",
    "art",
    "music",
    "geography",
    "economics",
    "psychology",
  ];

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        setError(json?.error || "Image upload failed");
        return;
      }
      setImageUrl(json.url);
      setImagePreview(json.url);
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    handleImageUpload(file);
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      handleImageUpload(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(file);
          handleImageUpload(file);
        }
        break;
      }
    }
  };

  const handleAdd = async () => {
    setError(null);

    if (!title || !topic || !content) {
      setError("Please fill all fields");
      return;
    }

    if (!user) {
      setError("You must be logged in to add knowledge");
      return;
    }

    // Validate that topic is a main subject, not a sub-topic
    const topicLower = topic.toLowerCase().trim();
    if (!validSubjects.includes(topicLower)) {
      setError(
        `"${topic}" is not a valid subject. Please use one of: ${validSubjects.join(", ")}`,
      );
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
      const enrichedContent = `Category: ${category}\nTags: ${tags.trim() || "none"}\n\n${content}`;

      const resp = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          topic: topicLower,
          content: enrichedContent,
          video_url: videoUrl || null,
          image_url: imageUrl || null,
          owner: user.id,
        }),
      });

      const json = await resp.json();
      if (!resp.ok || json?.error) {
        console.error("API insert failed", json);
        setError("Error saving post");
        return;
      }

      const inserted = json.data;
      router.push(`/p/${inserted.id}`);
    } catch (err) {
      console.error("Unexpected error inserting post", err);
      setError("Error saving post");
    }
  };

  const fetchOEmbed = async (url: string) => {
    if (!url) return;
    try {
      // Try YouTube oEmbed
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          setVideoPreview(data);
          if (!title) setTitle(data.title || "");
          return;
        }
      }
      // Try Vimeo oEmbed
      if (url.includes("vimeo.com")) {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          setVideoPreview(data);
          if (!title) setTitle(data.title || "");
          return;
        }
      }
      // For other platforms, just show a generic preview
      setVideoPreview({
        title: "Video link",
        author_name: url,
        thumbnail_url: null,
      });
    } catch (err) {
      console.warn("oEmbed fetch failed", err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Add Knowledge</h1>

        {error && !error.includes("not a valid subject") && (
          <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <div>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Subject (e.g., Math, Science, English)"
            className={`border p-2 w-full rounded ${
              error?.includes("not a valid subject")
                ? "border-red-500 bg-red-50"
                : ""
            }`}
          />
          <p className="text-sm text-gray-500 mt-1">
            Valid subjects: Math, Science, English, History, PE, Computer
            Science, Programming, Art, Music, Geography, Economics, Psychology
          </p>
          {error?.includes("not a valid subject") && (
            <p className="text-red-600 text-sm mt-2 font-semibold">{error}</p>
          )}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 w-full rounded"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="Fun">Fun</option>
            <option value="Guitar">Guitar</option>
            <option value="Money">Money</option>
            <option value="YouTube">YouTube</option>
            <option value="Science">Science</option>
            <option value="Math">Math</option>
            <option value="Programming">Programming</option>
            <option value="Productivity">Productivity</option>
            <option value="Life">Life</option>
          </select>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="border p-2 rounded"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the knowledge here..."
          className="border p-2 w-full h-40 rounded"
        />

        {/* Image attachment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Attach Image (optional)
          </label>
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Paste image URL or upload below"
              className="border p-2 flex-1 rounded"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm whitespace-nowrap"
            >
              {uploading ? "Uploading…" : "📷 Upload"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          {/* Drag & drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            Drag & drop an image here, or click to select. You can also paste
            (Ctrl+V) an image.
          </div>
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="max-w-xs max-h-48 rounded border object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  setImagePreview(null);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Video URL */}
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onBlur={() => fetchOEmbed(videoUrl)}
          placeholder="Optional video URL (YouTube, Vimeo, Dailymotion, or any video link)"
          className="border p-2 w-full rounded"
        />

        {videoPreview ? (
          <div className="flex items-center gap-4">
            {videoPreview?.thumbnail_url && (
              <img
                src={videoPreview.thumbnail_url}
                alt="thumb"
                className="w-36 h-20 object-cover rounded"
              />
            )}
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
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading image…" : "Publish"}
        </button>
      </div>
    </ErrorBoundary>
  );
}
