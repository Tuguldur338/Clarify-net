"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function PostActions({
  id,
  owner,
}: {
  id: string;
  owner?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const canEdit = !!(user && owner && user.id === owner);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: user?.id }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        setError(json?.error || "Delete failed");
        setLoading(false);
        setShowConfirm(false);
        return;
      }
      router.push("/my-knowledge");
    } catch (err) {
      console.error(err);
      setError(String(err));
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
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
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </>
        ) : null}
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-strong)] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4" style={{ color: "var(--foreground)" }}>
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
