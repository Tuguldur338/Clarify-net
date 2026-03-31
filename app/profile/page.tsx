"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import RoleBadge from "@/components/RoleBadge";
import MathText from "@/components/MathText";
import { Camera } from "lucide-react";
import { getRoleByPostCount } from "@/utils/roleUtils";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [appliedPosts, setAppliedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pictureUpdateKey, setPictureUpdateKey] = useState(Date.now());
  const router = useRouter();

  const loadAppliedPosts = async (userId: string) => {
    try {
      const stored =
        localStorage.getItem(`clarifynet.appliedPosts.${userId}`) || "[]";
      const appliedIds: string[] = Array.isArray(JSON.parse(stored))
        ? JSON.parse(stored)
        : [];

      if (appliedIds.length === 0) {
        setAppliedPosts([]);
        return;
      }

      const postResults = await Promise.all(
        appliedIds.map((id) =>
          fetch(`/api/posts?id=${encodeURIComponent(id)}`)
            .then((r) => r.json())
            .then((j) => j?.data)
            .catch(() => null),
        ),
      );

      setAppliedPosts(postResults.filter((x) => x));
    } catch (e) {
      console.error("Failed to load applied posts:", e);
      setAppliedPosts([]);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Refresh author data
    fetch(`/api/user/${user.id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.data) {
          setUser(j.data);
        }
      })
      .catch((e) => console.error("Failed to refresh user data:", e));

    setLoading(true);
    fetch(`/api/posts?owner=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((j) => {
        setPosts(j?.data || []);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
        loadAppliedPosts(user.id);
      });
  }, [user?.id]);

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

  const handleUpdatePicture = async (imageUrl: string) => {
    if (!user) return;

    console.log(
      "Updating profile picture with URL:",
      imageUrl.substring(0, 100),
    );

    try {
      // Save to database
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          profile_picture_url: imageUrl,
        }),
      });

      const json = await res.json();
      console.log("Update response:", json);

      if (!res.ok || json?.error) {
        alert(json?.error || "Failed to update profile picture");
        return;
      }

      // Update local state with data from database
      const updatedUser = json.data;
      console.log("Updated user:", updatedUser);
      // Read fresh user record from API to avoid session mix
      const refreshed = await fetch(`/api/user/${user.id}`).then((r) =>
        r.json(),
      );
      if (refreshed?.data) {
        setUser(refreshed.data);
      } else {
        setUser(updatedUser);
      }
      setPictureUpdateKey(Date.now()); // Force image reload
      setShowUploadModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update profile picture");
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
      <div className="mb-6 flex items-start gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 flex items-center justify-center bg-white">
            {user.profile_picture_url ? (
              <img
                src={
                  user.profile_picture_url.startsWith("data:")
                    ? user.profile_picture_url
                    : `${user.profile_picture_url}${user.profile_picture_url.includes("?") ? "&" : "?"}t=${pictureUpdateKey}&u=${user.id}`
                }
                alt={user.name || "Profile"}
                className="w-full h-full object-cover"
                key={`${pictureUpdateKey}-${user.id}-${user.profile_picture_url}`}
                onError={(e) => {
                  // Silently hide the image if it fails to load
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-blue-600 font-bold text-5xl">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="absolute bottom-0 right-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white hover:bg-gray-200 transition-all shadow-lg"
            title="Update profile picture"
          >
            <Camera size={20} className="text-gray-700" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-sm text-gray-600 mb-3">{user.email}</p>
          <div className="flex items-center gap-3 mb-3">
            <RoleBadge role={getRoleByPostCount(posts.length)} size="md" />
            <span className="text-sm text-gray-600">
              {posts.length} {posts.length === 1 ? "post" : "posts"} shared
            </span>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Edit profile picture
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Your published knowledge</h2>

      {/* Upload Modal */}
      {showUploadModal && (
        <ProfilePictureUpload
          currentPictureUrl={user.profile_picture_url}
          userName={user.name || user.email}
          userId={user.id}
          onSave={handleUpdatePicture}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Applied knowledge</h2>
        {loading ? (
          <div>Loading applied posts...</div>
        ) : appliedPosts.length > 0 ? (
          <ul className="space-y-3">
            {appliedPosts.map((p) => (
              <li key={p.id} className="p-3 border rounded bg-gray-50">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">{p.topic}</div>
                <p className="text-sm text-gray-700 mt-1">
                  <MathText value={p.content?.slice(0, 120)} />
                  {p.content && p.content.length > 120 ? "..." : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => router.push(`/p/${p.id}`)}
                    className="text-sm px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-600">No applied posts yet.</div>
        )}
      </div>
    </div>
  );
}
