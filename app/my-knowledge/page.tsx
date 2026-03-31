"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PostActions from "@/components/PostActions";
import RoleBadge from "@/components/RoleBadge";
import MathText from "@/components/MathText";
import { getRoleByName, getRoleByPostCount } from "@/utils/roleUtils";

export default function MyKnowledgePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPosts(user.id);
    }
  }, [user]);

  const fetchPosts = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?owner=${encodeURIComponent(userId)}`);
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

  if (!user)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold">Not logged in</h2>
        <p className="text-sm text-gray-600">
          Please log in to see your knowledge.
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Knowledge</h2>
        <div className="flex items-center gap-3">
          <RoleBadge
            role={
              user?.role
                ? getRoleByName(user.role)
                : getRoleByPostCount(posts?.length || 0)
            }
            size="md"
          />
          <span className="text-gray-600">
            {posts?.length || 0} posts shared
          </span>
        </div>
      </div>
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
                <MathText value={p.content?.slice(0, 180)} />
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
