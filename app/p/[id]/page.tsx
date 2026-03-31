"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PostActions from "@/components/PostActions";
import RoleBadge from "@/components/RoleBadge";
import MathText from "@/components/MathText";
import { getRoleByPostCount } from "@/utils/roleUtils";

export default function PostPage() {
  const params = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const applicationStorageKey = user
    ? `clarifynet.appliedPosts.${user.id}`
    : "clarifynet.appliedPosts.guest";

  const refreshApplied = () => {
    if (!data || !data.id) return;
    const stored = localStorage.getItem(applicationStorageKey) || "[]";
    const ids = Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
    setIsApplied(ids.includes(data.id));
  };

  const toggleApplied = () => {
    if (!data || !data.id) return;
    const stored = localStorage.getItem(applicationStorageKey) || "[]";
    const ids = Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
    const isNowApplied = !ids.includes(data.id);
    const nextIds = isNowApplied
      ? [...ids, data.id]
      : ids.filter((pid: string) => pid !== data.id);
    localStorage.setItem(applicationStorageKey, JSON.stringify(nextIds));
    setIsApplied(isNowApplied);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts?id=${params.id}`);
        const json = await res.json();
        if (!res.ok || json?.error) {
          setData(null);
        } else {
          setData(json.data);

          // Fetch author info if post has an owner
          if (json.data?.owner) {
            // Fetch author info and real post count by owner
            const [authorRes, ownerPostsRes] = await Promise.all([
              fetch(`/api/user/author?userId=${json.data.owner}`),
              fetch(`/api/posts?owner=${encodeURIComponent(json.data.owner)}`),
            ]);

            const authorJson = await authorRes.json();
            const ownerPostsJson = await ownerPostsRes.json();

            const ownerPostCount = Array.isArray(ownerPostsJson?.data)
              ? ownerPostsJson.data.length
              : 0;

            if (authorJson?.data) {
              setAuthor({
                ...authorJson.data,
                postCount: ownerPostCount,
              });
            } else {
              setAuthor({
                id: json.data.owner,
                name: "Unknown",
                postCount: ownerPostCount,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  useEffect(() => {
    if (data && data.id) {
      refreshApplied();
    }
  }, [data, applicationStorageKey]);

  // If we get here, data exists. (The rest of the page renders below.)

  if (loading) return <div className="p-6 max-w-3xl mx-auto">Loading...</div>;

  if (!data) return <div className="p-6 max-w-3xl mx-auto">Post not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-gray-500 mt-2">Topic: {data.topic}</p>

          {author && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                By {author.name || author.email}
              </p>
              <div className="flex items-center gap-2">
                {(() => {
                  const rawCount = author.postCount ?? 0;
                  const safeCount = Math.max(rawCount, 1);
                  return (
                    <>
                      <RoleBadge
                        role={getRoleByPostCount(safeCount)}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600">
                        {safeCount} posts
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          {user ? (
            <button
              onClick={toggleApplied}
              className={`mt-4 px-4 py-2 rounded text-sm font-medium transition ${
                isApplied
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {isApplied ? "Remove applied status" : "Mark as applied"}
            </button>
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              Log in to mark this post as applied.
            </p>
          )}
        </div>
        <div>
          <PostActions id={data.id} owner={data.owner} />
        </div>
      </div>
      <div className="whitespace-pre-wrap">
        <MathText value={data.content} />
      </div>

      {data.image_url ? (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Attached image</div>
          <img
            src={data.image_url}
            alt={data.title || "Attached image"}
            className="max-w-full rounded border"
          />
        </div>
      ) : null}

      {data.video_url ? (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Attached video</div>
          <VideoEmbed url={data.video_url} />
        </div>
      ) : null}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return (
      <div className="w-full aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return (
      <div className="w-full aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  const dailymotionId = extractDailymotionId(url);
  if (dailymotionId) {
    return (
      <div className="w-full aspect-video">
        <iframe
          src={`https://www.dailymotion.com/embed/video/${dailymotionId}`}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Generic video URL — try HTML5 video player, with a link fallback
  const isDirectVideo = /\.(mp4|webm|ogg)($|\?)/.test(url);
  if (isDirectVideo) {
    return (
      <div className="w-full aspect-video">
        <video controls className="w-full h-full rounded">
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Fallback: render as a clickable link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline break-all"
    >
      {url}
    </a>
  );
}

function extractYouTubeId(url: string) {
  if (!url) return "";
  const reg =
    /(?:youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const m = url.match(reg);
  return m ? m[1] : "";
}

function extractVimeoId(url: string) {
  if (!url) return "";
  const reg = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const m = url.match(reg);
  return m ? m[1] : "";
}

function extractDailymotionId(url: string) {
  if (!url) return "";
  const reg = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;
  const m = url.match(reg);
  return m ? m[1] : "";
}
