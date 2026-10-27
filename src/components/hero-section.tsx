import Link from "next/link";

const APP_URL = "https://app.usetallyhouse.com/";

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-10 md:py-24">
        <div>
          <p className="mb-5 inline-flex items-center rounded-pill bg-primary-light px-3 py-1.5 text-sm font-medium text-text">
            Inventory &amp; sales tracking
          </p>

          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
            Keep track of your stock and sales.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-text-muted sm:text-lg">
            Manage your products, record sales, and keep track of customer debts
            with TallyHouse.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={APP_URL}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-input bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
            >
              Get started
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#features"
              className="inline-flex min-h-12 items-center justify-center rounded-input border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-primary-light"
            >
              Explore features
            </a>
          </div>
        </div>

        <div
          aria-label="TallyHouse inventory and sales overview preview"
          className="relative"
        >
          <div className="absolute -inset-4 -z-10 rounded-card bg-primary-light/70 blur-2xl" />

          <div className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-sm text-text-muted">Business overview</p>
                <h2 className="mt-1 text-lg font-semibold text-text">
                  Your store at a glance
                </h2>
              </div>

              <div className="flex size-10 items-center justify-center rounded-input bg-primary-light text-primary">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8v-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-input border border-border p-4">
                <p className="text-xs text-text-muted">Products</p>
                <p className="mt-2 text-2xl font-bold text-text">Stock</p>
                <p className="mt-1 text-xs text-text-muted">
                  Track your inventory
                </p>
              </div>

              <div className="rounded-input border border-border p-4">
                <p className="text-xs text-text-muted">Sales</p>
                <p className="mt-2 text-2xl font-bold text-text">Records</p>
                <p className="mt-1 text-xs text-text-muted">
                  Keep sales organised
                </p>
              </div>

              <div className="col-span-2 rounded-input bg-primary-light/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-input bg-surface text-primary">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M12 3v18m5-14H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="font-semibold text-text">Credit sales</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Keep track of customer debts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-text-muted">
              Illustrative preview of TallyHouse features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
