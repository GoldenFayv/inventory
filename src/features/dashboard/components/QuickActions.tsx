
import { Link } from 'react-router-dom';
import { Plus, PackagePlus } from 'lucide-react';

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading ">
      <h2
        id="quick-actions-heading"
        className="text-lg font-bold text-text"
      >
        Quick actions
      </h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/sales/new"
          className="flex min-h-14 items-center justify-center gap-2 rounded-input bg-primary px-5 py-4 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-offset-4"
        >
          <Plus size={21} aria-hidden="true" />
          Record Sale
        </Link>

        <Link
          to="/products/new"
          className="flex min-h-14 items-center justify-center gap-2 rounded-input border border-border bg-surface px-5 py-4 font-semibold text-text transition-colors hover:bg-background"
        >
          <PackagePlus size={21} aria-hidden="true" />
          Add Product
        </Link>

        {/* <Link
          to="/debts"
          className="flex min-h-14 items-center justify-center gap-2 rounded-input border border-border bg-surface px-5 py-4 font-semibold text-text transition-colors hover:bg-background sm:col-span-2"
        >
          <Users size={21} aria-hidden="true" />
          View Customer Debts
        </Link> */}
      </div>
    </section>
  );
}
