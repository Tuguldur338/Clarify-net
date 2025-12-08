"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleRegister = async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          profile_picture_url: profilePictureUrl || null 
        }),
      });
      const j = await res.json();
      if (!res.ok || j?.error) {
        setError(j?.error || "Registration failed");
        return;
      }
      const user = j.data;
      setUser(user); // Update AuthContext instantly
      router.push("/profile");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
      {error ? <div className="text-red-600 mb-2">{error}</div> : null}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border p-2 w-full rounded mb-2"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 w-full rounded mb-2"
      />

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture (optional)
        </label>
        <div className="flex gap-2">
          <input
            value={profilePictureUrl}
            onChange={(e) => setProfilePictureUrl(e.target.value)}
            placeholder="Enter image URL"
            className="border p-2 flex-1 rounded"
          />
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Camera size={18} />
            Upload
          </button>
        </div>
        {profilePictureUrl && (
          <div className="mt-2">
            <img
              src={profilePictureUrl}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          className="border p-2 w-full rounded pr-10"
          aria-label="Registration password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Register
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <ProfilePictureUpload
          currentPictureUrl={profilePictureUrl}
          userName={name || "Your"}
          onSave={async (url) => {
            setProfilePictureUrl(url);
            setShowUploadModal(false);
          }}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
