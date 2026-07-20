"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import RoleBadge from "@/components/RoleBadge";
import MathText from "@/components/MathText";
import { Camera } from "lucide-react";
import { getRoleByPostCount, getUserRole } from "@/utils/roleUtils";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [appliedPosts, setAppliedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pictureUpdateKey, setPictureUpdateKey] = useState(Date.now());
  const [targetUserId, setTargetUserId] = useState("");
  const [targetRole, setTargetRole] = useState("USER");
  const [adminMessage, setAdminMessage] = useState<string | React.ReactNode>(
    "",
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const currentRole = user
    ? getUserRole(posts.length, user.role)
    : getRoleByPostCount(posts.length);

  const isAdmin =
    (user?.role || "USER").toUpperCase() === "ADMIN" ||
    (user?.role || "USER").toUpperCase() === "DEVELOPER";
  const isDeveloperRole = (user?.role || "USER").toUpperCase() === "DEVELOPER";

  const isContentCreator = currentRole.title === "Content Creator";
  const isDeveloperUser = currentRole.title === "Developer";

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

  const handleDelete = async () => {
    const ownerId = user?.id;
    if (!deleteId || !ownerId) return;
    try {
      const res = await fetch(`/api/posts/${deleteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: ownerId }),
      });
      const j = await res.json();
      if (!res.ok || j?.error) {
        alert(j?.error || "Delete failed");
        setShowConfirmDelete(false);
        setDeleteId(null);
        return;
      }
      setPosts((p) => p.filter((x) => x.id !== deleteId));
      // Re-fetch posts to ensure UI is up to date
      fetch(`/api/posts?owner=${encodeURIComponent(ownerId)}`)
        .then((r) => r.json())
        .then((j) => {
          setPosts(j?.data || []);
        })
        .catch((e) => console.error(e));
      setShowConfirmDelete(false);
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      alert("Delete failed");
      setShowConfirmDelete(false);
      setDeleteId(null);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
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

  const assignBadgeRole = async () => {
    if (!isAdmin) {
      setAdminMessage("Only ADMIN or DEVELOPER users can assign roles.");
      return;
    }

    if (!targetUserId.trim()) {
      setAdminMessage("Please provide a target user ID, email, or name.");
      return;
    }

    if (!targetRole.trim()) {
      setAdminMessage("Please select a role to assign.");
      return;
    }

    try {
      if (!user) {
        setAdminMessage("No signed-in user. Login required.");
        return;
      }

      let targetId = targetUserId.trim();
      let targetLabel = targetId;
      let lookupUrl: string;

      if (targetId.includes("@")) {
        lookupUrl = `/api/user?email=${encodeURIComponent(targetId)}`;
      } else if (/^[0-9a-fA-F-]{36}$/.test(targetId)) {
        lookupUrl = `/api/user?id=${encodeURIComponent(targetId)}`;
      } else {
        lookupUrl = `/api/user?name=${encodeURIComponent(targetId)}`;
      }

      const lookupRes = await fetch(lookupUrl);
      const lookupJson = await lookupRes.json();
      if (!lookupRes.ok || lookupJson?.error || !lookupJson?.data) {
        setAdminMessage(
          lookupJson?.error ||
            `Could not find a user with ${
              targetId.includes("@")
                ? "that email"
                : /^[0-9a-fA-F-]{36}$/.test(targetId)
                  ? "that user ID"
                  : "that name"
            }.`,
        );
        return;
      }
      targetId = lookupJson.data.id;
      targetLabel = lookupJson.data.name || lookupJson.data.email || targetId;

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetId,
          role: targetRole,
          actingUserId: user.id,
        }),
      });

      const json = await res.json();
      if (!res.ok || json?.error) {
        setAdminMessage(json?.error || "Failed to update user role.");
        return;
      }

      setAdminMessage(
        <span>
          Successfully set role for user {targetLabel} to {targetRole}.{" "}
          <a
            href={`/profile/${targetId}`}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile →
          </a>
        </span>,
      );

      // If this was targeting the current user, refresh user state.
      if (targetId === user.id && json?.data) {
        setUser(json.data);
      }
    } catch (error) {
      console.error("Role update error:", error);
      setAdminMessage("Failed to update user role.");
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
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 flex items-center justify-center bg-[var(--surface)]">
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
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white hover:bg-[rgba(255,255,255,0.08)] transition-all shadow-lg"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            title="Update profile picture"
          >
            <Camera size={20} className="text-gray-700" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-sm text-gray-600 mb-3">{user.email}</p>
          <div className="flex items-center gap-3 mb-3">
            <RoleBadge role={currentRole} size="md" />
            <span className="text-sm text-gray-600">
              {posts.length} {posts.length === 1 ? "post" : "posts"} shared
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3 max-w-2xl">
            {isContentCreator
              ? "You are a verified Content Creator. This badge is a trusted creator signal and helps your content stand out."
              : isDeveloperUser
                ? "You have the Developer badge, which is the highest-level app role for managing badges and experience."
                : "Your badge reflects your current contribution level. Content Creator is a verified creator role, while Developer is the top-level app role."}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Edit profile picture
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-lg font-semibold mb-2">
            Role Management (Admin/Developer)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            You have badge-management permissions as{" "}
            <strong>{user.role || "User"}</strong>. Developer is the top-level
            owner role, while Content Creator is the verified creator badge.
            Your team can assign both if needed.
          </p>
          <p className="text-sm text-blue-700 mb-3">
            Need Developer first? If no Developer exists, the first registered
            user gets Developer by default (you can log in and confirm).
          </p>
          <div className="space-y-2">
            <input
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Target user ID, email, or name"
              className="border p-2 rounded w-full"
            />
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="border p-2 rounded w-full bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
            >
              <option value="USER">User</option>
              <option value="BEGINNER">Beginner</option>
              <option value="CONTRIBUTOR">Contributor</option>
              <option value="EXPERT">Expert</option>
              <option value="MASTER">Master</option>
              <option value="CONTENT_CREATOR">Content Creator</option>
              {isDeveloperRole ? (
                <>
                  <option value="ADMIN">Admin</option>
                  <option value="DEVELOPER">Developer</option>
                </>
              ) : null}
            </select>
            <button
              onClick={assignBadgeRole}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Assign role
            </button>
            {adminMessage && (
              <div className="text-sm text-gray-700">{adminMessage}</div>
            )}
          </div>
        </div>
      )}

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
                className="text-sm px-3 py-1 rounded transition-all duration-300"
                style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              >
                View
              </button>

              <button
                onClick={() => router.push(`/edit/${p.id}`)}
                className="text-sm px-3 py-1 rounded transition-all duration-300"
                style={{ backgroundColor: "rgba(250, 204, 21, 0.14)", color: "var(--foreground)" }}
              >
                Edit
              </button>

              <button
                onClick={() => openDeleteConfirm(p.id)}
                className="text-sm px-3 py-1 rounded transition-all duration-300"
                style={{ backgroundColor: "rgba(248, 113, 113, 0.18)", color: "var(--foreground)" }}
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
                    className="text-sm px-3 py-1 rounded transition-all duration-300"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.16)", color: "var(--foreground)" }}
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

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-strong)] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4" style={{ color: "var(--foreground)" }}>
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
