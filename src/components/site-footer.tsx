import Link from "next/link";

const APP_URL = "https://app.usetallyhouse.com/";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-sm">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-text"
            >
              TallyHouse
            </Link>

            <p className="mt-3 text-sm leading-6 text-text-muted">
              A simple way to keep track of your inventory, sales, and customer
              debts.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link
              href="#features"
              className="text-text-muted transition-colors hover:text-text"
            >
              Features
            </Link>

            <Link
              href="#pricing"
              className="text-text-muted transition-colors hover:text-text"
            >
              Pricing
            </Link>

            <Link
              href={APP_URL}
              className="text-text-muted transition-colors hover:text-text"
            >
              Open app
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-text-muted">
            © 2026 TallyHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
