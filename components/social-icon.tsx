import { StoreIcon } from "@/components/store-icon";
import type { SocialPlatform } from "@/lib/types";

const PATHS: Record<"instagram" | "facebook" | "twitter", string> = {
  instagram: [
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z",
    "M7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Z",
    "M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z",
    "M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
    "M17.5 5.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z",
  ].join(" "),
  facebook:
    "M13.4 21v-7.9h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5h1.65V3.7c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.4H7.4v3.1h2.75V21h3.25Z",

  twitter:
    "M17.5 3h3.1l-6.8 7.8L21.5 21h-5.5l-4.3-5.6L6.6 21H3.5l7.2-8.2L3 3h5.6l4 5.3L17.5 3Zm-1.1 16.1h1.7L7.5 4.8H5.7l10.7 14.3Z",
};

export function SocialIcon({
  platform,
  className = "size-4",
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  if (platform === "youtube" || platform === "spotify") {
    return <StoreIcon store={platform} className={className} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden
    >
      <path d={PATHS[platform]} />
    </svg>
  );
}
