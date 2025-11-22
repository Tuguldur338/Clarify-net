"use client";

import React, { useEffect, useState } from "react";
import PostActions from "@/components/PostActions";

export default function MyKnowledgePage() {
  const [owner, setOwner] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const me = localStorage.getItem("clarifynet_owner");
      setOwner(me);
      if (me) fetchPosts(me);
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchPosts = async (me: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?owner=${encodeURIComponent(me)}`);
      const json = await res.json();
      if (!res.ok || json?.error) {
        setPosts([]);
      } else {
        setPosts(json.data || []);
      }
    } catch (e) {
      console.error(e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!owner)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold">No owner token</h2>
        <p className="text-sm text-gray-600">
          You don't have a local owner token yet. Create a post and you'll be
          able to manage it here.
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Knowledge</h2>
      {loading ? (
        <div>Loading…</div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{p.title}</div>
                  <div className="text-sm text-gray-500">Topic: {p.topic}</div>
                </div>
                <PostActions id={p.id} owner={p.owner} />
              </div>
              <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                {p.content?.slice(0, 180)}
                {p.content && p.content.length > 180 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No posts found for your account.</div>
      )}
    </div>
  );
}
