import { useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { setProfilePic } from "../api/user.api";
import Avatar from "../components/Avatar";
import { toast } from "react-toastify";
import { logoutUser } from "../api/auth.api";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
        bg-gray-50 dark:bg-slate-950
        text-slate-500 dark:text-gray-400
      "
      >
        Loading profile...
      </div>
    );
  }

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

  const handleUpload = async () => {
    try {
      if (!selectedFile) return;

      setIsUploading(true);
      const res = await setProfilePic(user.id, selectedFile);

      setUser(res.data);
      setPreview(null);
      setSelectedFile(null);

      toast.success("Profile pic updated successfully");
    } catch (error) {
      console.log("unable to upload profile pic", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const [deleteAcc, setDeleteAcc] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await logoutUser();
      setUser(null);
      toast.success("Account Logout successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gray-50 dark:bg-slate-950
        transition-colors
      "
    >
      <div
        className="
          w-full max-w-md
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-800
          rounded-2xl shadow-xl
          p-8
        "
      >
        <div className="flex flex-col items-center relative">
          <div className="relative group">
            <Avatar
              src={preview || user.profilePic}
              username={user.username}
              size="lg"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="
                absolute inset-0 rounded-full
                bg-black/40 opacity-0
                group-hover:opacity-100
                flex items-center justify-center
                text-white text-sm font-medium
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

          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-gray-100">
            {user.username}
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>
        {preview && !isUploading && (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleUpload}
              className="
                flex-1
                bg-indigo-600 hover:bg-indigo-700
                transition
                text-white text-sm font-medium
                py-2 rounded-lg
              "
            >
              Save
            </button>

            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              className="
                flex-1
                bg-slate-200 dark:bg-slate-800
                hover:bg-slate-300 dark:hover:bg-slate-700
                transition
                text-slate-800 dark:text-gray-200
                text-sm font-medium
                py-2 rounded-lg
              "
            >
              Cancel
            </button>
          </div>
        )}
        <div className="my-6 border-t border-gray-200 dark:border-slate-800" />
        <div className="space-y-4">
          <div className="text-center text-slate-700 dark:text-gray-300">
            {user.status || "Hey there! I’m using Connectly 👋"}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              User ID
            </p>
            <p className="text-sm text-slate-700 dark:text-gray-200 break-all">
              {user.id}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Account Status
            </p>
            <span className="inline-flex items-center gap-2 text-sm text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Active
            </span>
          </div>
        </div>
        {!isDeleting && (
          <div className="mt-8 flex gap-3">
            {!deleteAcc ? (
              <>
                <button
                  onClick={handleLogout}
                  className="
                    flex-1
                    bg-slate-200 dark:bg-slate-800
                    hover:bg-slate-300 dark:hover:bg-slate-700
                    transition
                    text-slate-800 dark:text-gray-200
                    text-sm font-medium
                    py-2 rounded-lg
                  "
                >
                  Logout
                </button>

                <button
                  onClick={() => setDeleteAcc(true)}
                  className="
                    flex-1
                    bg-red-500/10 hover:bg-red-500/20
                    transition
                    text-red-500
                    text-sm font-medium
                    py-2 rounded-lg
                  "
                >
                  Delete Account
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleDelete()}
                  className="
                    flex-1
                    bg-red-600 hover:bg-red-700
                    transition
                    text-white
                    text-sm font-medium
                    py-2 rounded-lg
                  "
                >
                  Confirm Delete
                </button>

                <button
                  onClick={() => setDeleteAcc(false)}
                  className="
                    flex-1
                    bg-slate-200 dark:bg-slate-800
                    hover:bg-slate-300 dark:hover:bg-slate-700
                    transition
                    text-slate-800 dark:text-gray-200
                    text-sm font-medium
                    py-2 rounded-lg
                  "
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
