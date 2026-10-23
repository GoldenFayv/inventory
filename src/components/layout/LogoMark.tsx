import type { ReactNode } from "react";

type LogoProps = {
  /** Show only the icon tile, no wordmark */
  iconOnly?: boolean;
  /** Tile size in px for the icon (default 44) */
  size?: number;
  /** Show the "Manage your shop" tagline under the name */
  tagline?: string;
  className?: string;
};

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-hover shadow-md shadow-primary/30 ring-1 ring-white/20"
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.55, height: size * 0.55 }}
        className="text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M9 13v4M11.5 13v4M14 13v4" strokeWidth="1.8" />
        <path d="M8 16.5 15.5 13.5" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

export default function Logo({
  iconOnly = false,
  size = 44,
  tagline,
  className = "",
}: LogoProps): ReactNode {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />

      {!iconOnly && (
        <div className="min-w-0">
          <span className="block text-xl font-extrabold leading-none tracking-tight text-text">
            Tally<span className="text-primary">House</span>
          </span>
          {tagline && (
            <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-widest text-text-muted">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
