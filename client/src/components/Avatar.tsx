type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  username: string;
  src?: string | null;
  size?: AvatarSize;
};

const sizeMap: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-24 w-24 text-2xl",
};

const Avatar = ({ username, src, size = "md" }: AvatarProps) => {
  const letter = username?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      aria-label={username}
      title={username}
      className={`
        ${sizeMap[size]}
        relative
        flex items-center justify-center
        rounded-full
        overflow-hidden
        select-none
        shadow-md
        ring-2 ring-white/10
        bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500
        text-white font-semibold
      `}
    >
      {src ? (
        <img src={src} alt={username} className="h-full w-full object-cover" />
      ) : (
        <span>{letter}</span>
      )}
    </div>
  );
};

export default Avatar;
