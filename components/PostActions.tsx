"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function PostActions({
  id,
  owner,
}: {
  id: string;
  owner?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentUser = (() => {
    try {
      const s = localStorage.getItem("clarifynet_user");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  })();

  const canEdit = !!(currentUser && owner && currentUser.id === owner);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, owner: currentUser?.id }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        setError(json?.error || "Delete failed");
        setLoading(false);
        return;
      }
      router.push("/my-knowledge");
    } catch (err) {
      console.error(err);
      setError(String(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push(`/p/${id}`)}
        className="text-sm text-gray-600 hover:underline"
      >
        View
      </button>
      {canEdit ? (
        <>
          <button
            onClick={() => router.push(`/edit/${id}`)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </>
      ) : null}
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </div>
  );
}
