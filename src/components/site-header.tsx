import Link from "next/link";

const APP_URL = "https://app.usetallyhouse.com/";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6"
      >
        <Link
          href="/"
          aria-label="TallyHouse home"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex size-9 items-center justify-center rounded-input bg-primary text-text-inverse">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </span>

          <span className="text-lg font-bold tracking-tight text-text">
            TallyHouse
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="#features"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            Features
          </Link>

          <Link
            href="#how-it-works"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            How it works
          </Link>

          <Link
            href="#pricing"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            Pricing
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={APP_URL}
            className="hidden text-sm font-medium text-text transition-colors hover:text-primary sm:inline-flex"
          >
            Log in
          </Link>

          <Link
            href={APP_URL}
            className="inline-flex min-h-10 items-center justify-center rounded-input bg-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
