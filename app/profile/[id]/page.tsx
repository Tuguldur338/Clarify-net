"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/RoleBadge";
import MathText from "@/components/MathText";
import { getRoleByPostCount, getUserRole } from "@/utils/roleUtils";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;
  const isAdmin =
    (user?.role || "USER").toUpperCase() === "ADMIN" ||
    (user?.role || "USER").toUpperCase() === "DEVELOPER";

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userRes = await fetch(`/api/user/${userId}`);
        const userJson = await userRes.json();

        if (!userRes.ok || userJson?.error) {
          setError(userJson?.error || "User not found");
          return;
        }

        setProfileUser(userJson.data);

        // Fetch user's posts
        const postsRes = await fetch(
          `/api/posts?owner=${encodeURIComponent(userId)}`,
        );
        const postsJson = await postsRes.json();
        setPosts(postsJson?.data || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-red-600">Error: {error || "User not found"}</div>
      </div>
    );
  }

  const userRole = getUserRole(posts.length, profileUser.role);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-start gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 flex items-center justify-center bg-white">
            {profileUser.profile_picture_url ? (
              <img
                src={profileUser.profile_picture_url}
                alt={profileUser.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-5xl">
                {(profileUser.name || profileUser.email)
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {profileUser.name || profileUser.email}
          </h1>
          <p className="text-sm text-gray-600 mb-3">{profileUser.email}</p>
          <div className="flex items-center gap-3 mb-3">
            <RoleBadge role={userRole} size="md" />
            <span className="text-sm text-gray-600">
              {posts.length} {posts.length === 1 ? "post" : "posts"} shared
            </span>
          </div>
          <p className="text-sm text-gray-700 max-w-2xl">
            {userRole.title === "Content Creator"
              ? "This user is a verified Content Creator. This badge indicates trusted content creation."
              : userRole.title === "Developer"
                ? "This user has Developer privileges, which include app management and badge administration."
                : "This user's badge reflects their current contribution level."}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Published knowledge</h2>

      {posts.length > 0 ? (
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
                  onClick={() => window.open(`/p/${p.id}`, "_blank")}
                  className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-400 transition-all duration-300"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-600 mt-4">No posts yet.</div>
      )}
    </div>
  );
}
