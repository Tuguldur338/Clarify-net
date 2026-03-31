"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Link as LinkIcon, X } from "lucide-react";

interface ProfilePictureUploadProps {
  currentPictureUrl?: string;
  userName: string;
  userId?: string;
  onSave: (imageUrl: string) => Promise<void>;
  onCancel: () => void;
}

export default function ProfilePictureUpload({
  currentPictureUrl,
  userName,
  userId,
  onSave,
  onCancel,
}: ProfilePictureUploadProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [previewUrl, setPreviewUrl] = useState<string>(currentPictureUrl || "");
  const [urlInput, setUrlInput] = useState<string>(currentPictureUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create a local preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    if (url.trim()) {
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl: string;

      if (mode === "upload" && selectedFile) {
        // Use the generated preview base64 URL directly so upload works in local/mock mode
        if (!previewUrl) {
          alert("Please select an image to upload.");
          setSaving(false);
          return;
        }

        imageUrl = previewUrl;
      } else if (mode === "url") {
        imageUrl = urlInput.trim();
        if (!imageUrl) {
          alert("Please provide a valid URL");
          setSaving(false);
          return;
        }
      } else {
        alert("Please select or provide an image");
        setSaving(false);
        return;
      }

      await onSave(imageUrl);
      setStatusMessage("Profile picture updated successfully!");
    } catch (e) {
      console.error("Save error:", e);
      setStatusMessage("Failed to save profile picture. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Update Profile Picture</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b">
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-all ${
              mode === "upload"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Upload size={18} />
            Upload Photo
          </button>
          <button
            onClick={() => setMode("url")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-all ${
              mode === "url"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LinkIcon size={18} />
            Add URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {statusMessage ? (
            <div className="bg-green-100 text-green-800 rounded-md p-2 mb-4 text-sm">
              {statusMessage}
            </div>
          ) : null}
          {mode === "upload" ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      {isDragging ? "Drop your photo here" : "Add Photo"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or drag and drop
                    </p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Paste a link from Facebook, Twitter, Instagram, or any image URL
              </p>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-white">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500">Your profile picture</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!previewUrl || saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
