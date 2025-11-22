"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const u = localStorage.getItem("clarifynet_user");
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/posts?owner=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((j) => {
        setPosts(j?.data || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, owner: user?.id }),
      });
      const j = await res.json();
      if (!res.ok || j?.error) {
        alert(j?.error || "Delete failed");
        return;
      }
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  if (!user)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        Please sign in to see your posts.
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
      <p className="text-sm text-gray-600 mb-4">Your published knowledge</p>
      {loading ? <div>Loading...</div> : null}
      <ul className="space-y-4">
        {posts.map((p) => (
          <li
            key={p.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{p.title}</div>

              <div className="text-sm text-gray-500">{p.topic}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/p/${p.id}`)}
                className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-400 transition-all duration-300"
              >
                View
              </button>

              <button
                onClick={() => router.push(`/edit/${p.id}`)}
                className="text-sm px-3 py-1 bg-yellow-100 rounded hover:bg-yellow-400 transition-all duration-300"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                className="text-sm px-3 py-1 bg-red-100 rounded hover:bg-red-400 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {posts.length === 0 && !loading ? (
        <div className="text-sm text-gray-600 mt-4">You have no posts yet.</div>
      ) : null}
    </div>
  );
}
