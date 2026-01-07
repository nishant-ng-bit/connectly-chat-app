type AvatarProps = {
  username: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
};

const Avatar = ({ username, size = "md" }: AvatarProps) => {
  const letter = username?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      aria-label={username}
      title={username}
      className={`
        ${sizeMap[size]}
        rounded-full
        bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500
        flex items-center justify-center
        font-semibold text-white
        shadow-md
        ring-2 ring-white/10
        select-none
      `}
    >
      {letter}
    </div>
  );
};

export default Avatar;
