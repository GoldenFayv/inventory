import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, House, Search } from "lucide-react";
import LogoMark from "../components/layout/LogoMark";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12 text-text">
      <div className="w-full max-w-lg">
        <div className="mb-12 flex justify-center">
          <Link to="/" aria-label="TallyHouse home">
            <LogoMark />
          </Link>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-7 text-center sm:p-10">
          <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-border" />
            <div className="absolute inset-3 rounded-full border border-dashed border-border" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Search size={34} strokeWidth={1.6} />
            </div>

            <span className="absolute right-1 top-3 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-text-muted">
              404
            </span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Page not found
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Looks like a missing item.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-text-muted">
            We couldn't find the page you're looking for. It may have moved, or
            the link might be incorrect.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-input border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:bg-background"
            >
              <ArrowLeft size={17} />
              Go back
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <House size={17} />
              Back to TallyHouse
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          TallyHouse · Keep your business moving.
        </p>
      </div>
    </main>
  );
}
