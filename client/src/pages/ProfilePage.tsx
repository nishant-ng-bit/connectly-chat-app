import { useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { setProfilePic } from "../api/user.api";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-400">
        Loading profile...
      </div>
    );
  }

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPLOAD HANDLER ================= */
  const handleUpload = async () => {
    try {
      if (!selectedFile) return;

      await setProfilePic(user.id, selectedFile);

      setPreview(null);
      setSelectedFile(null);
    } catch (error) {
      console.log("unable to upload profile pic", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
        {/* ================= AVATAR ================= */}
        <div className="flex flex-col items-center relative">
          <div className="relative group">
            {preview || user.profilePic ? (
              <img
                src={preview || user.profilePic || ""}
                alt="Profile"
                className="
                  h-32 w-32 rounded-full object-cover
                  border-4 border-indigo-500/40
                  shadow-lg
                "
              />
            ) : (
              <Avatar username={user.username} />
            )}

            {/* Hover overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              className="
                absolute inset-0 rounded-full
                bg-black/40 opacity-0
                group-hover:opacity-100
                flex items-center justify-center
                text-white text-sm
                transition
              "
            >
              Change
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-100">
            {user.username}
          </h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {/* ================= PREVIEW ACTIONS ================= */}
        {preview && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUpload}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-medium py-2 rounded-lg"
            >
              Save
            </button>

            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 transition text-gray-200 text-sm font-medium py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ================= DIVIDER ================= */}
        <div className="my-6 border-t border-slate-800" />

        {/* ================= INFO ================= */}
        <div className="space-y-4">
          <div className="text-white text-center">{user.status}</div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              User ID
            </p>
            <p className="text-sm text-gray-200 break-all">{user.id}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Account Status
            </p>
            <span className="inline-flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Active
            </span>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-8 flex gap-3">
          <button
            disabled
            className="flex-1 bg-slate-800 text-gray-400 text-sm font-medium py-2 rounded-lg cursor-not-allowed"
          >
            Edit Profile
          </button>

          <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 transition text-red-400 text-sm font-medium py-2 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
