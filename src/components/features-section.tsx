const features = [
  {
    number: "01",
    title: "Manage your inventory",
    description: "Keep your product list and stock quantities organised.",
    icon: "📦",
  },
  {
    number: "02",
    title: "Record your sales",
    description:
      "Record transactions and keep your sales history in one place.",
    icon: "🧾",
  },
  {
    number: "03",
    title: "Track customer debts",
    description: "Record credit sales and see outstanding customer balances.",
    icon: "🤝",
  },
  {
    number: "04",
    title: "Manage your store",
    description: "Keep your store's business records organised as you work.",
    icon: "🏪",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            The essentials for everyday business.
          </h2>

          <p className="mt-4 leading-7 text-text-muted">
            The tools you need to keep track of your stock, sales, and customer
            credit.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="rounded-card border border-border bg-background p-6 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>

                <span className="text-xs font-semibold text-text-muted">
                  {feature.number}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-semibold text-text">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
