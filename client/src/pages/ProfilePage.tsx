import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { setProfilePic } from "../api/user.api";
import Avatar from "../components/Avatar";
import { toast } from "react-toastify";
import { logoutUser } from "../api/auth.api";

const formatDate = (value?: string) => {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-10 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
          Loading profile...
        </div>
      </main>
    );
  }

  const isGuest = user.email?.endsWith("@guests.connectly.local");
  const displayEmail = isGuest ? "Guest session" : user.email;
  const joinedAt = formatDate(user.createdAt);
  const statusText = isGuest
    ? "Temporary Connectly guest profile"
    : user.status || "Hi! I'm using Connectly";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
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

      toast.success("Profile photo updated");
    } catch (error) {
      toast.error("Unable to upload profile photo");
      console.log("unable to upload profile pic", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async (redirectTo = "/") => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setUser(null);
      toast.success("Logged out successfully");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error("Unable to logout");
      console.log(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(199,210,254,0.75),transparent_28rem),radial-gradient(circle_at_82%_18%,rgba(187,247,208,0.42),transparent_26rem),linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(79,70,229,0.22),transparent_30rem),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.12),transparent_28rem),linear-gradient(180deg,#020617_0%,#0f172a_62%,#111827_100%)]" />

      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-slate-200/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 dark:shadow-black/25 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar src={preview || user.profilePic} username={user.username} size="lg" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/55 text-sm font-extrabold text-white opacity-0 transition group-hover:opacity-100"
              >
                Change
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="mt-5 flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{user.username}</h1>
              {isGuest && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                  Guest
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{displayEmail}</p>
            <p className="mt-4 max-w-sm rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold leading-6 text-slate-650 dark:bg-slate-950/70 dark:text-slate-300">
              {statusText}
            </p>
          </div>

          {preview && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={handleUpload}
                className="rounded-2xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading ? "Saving..." : "Save photo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Joined</p>
              <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">{joinedAt}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isGuest && (
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-6 shadow-xl shadow-amber-100/60 dark:border-amber-400/20 dark:bg-amber-400/10 dark:shadow-black/15 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">Guest profile</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Sign up to save your data.</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-650 dark:text-slate-300">
                This is a temporary guest account for trying Connectly. Create a real account to keep your identity, chats, groups, media, and profile across devices.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => handleLogout("/register")}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Sign up and save data
                </button>
                <Link
                  to="/chats"
                  className="rounded-2xl border border-amber-200 bg-white/80 px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100 dark:hover:bg-slate-950"
                >
                  Keep exploring
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 dark:shadow-black/20 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Account</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Profile settings</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                  Manage your photo and session. More profile controls can live here later without making the page feel crowded.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">Profile photo</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">PNG, JPG or WEBP up to 5MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-500"
                >
                  Upload
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">User ID</p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-700 dark:text-slate-200">{user.id}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => handleLogout()}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
              {!isGuest && (
                <p className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Account deletion is not enabled yet, so this page will not pretend to delete anything.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
