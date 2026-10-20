import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../app/AuthProvider";
import StoreForm from "./component/StoreForm";
import StoreFormSkeleton from "./component/StoreFormSkeleton";

export default function StorePage() {
  const { user, refreshUser } = useAuth();
  const storeQuery = user?.store_user?.store;
  // TODO: wire this to the user's permissions (e.g. "store.update").
  const canEdit = true;

  return (
    <main className="space-y-6 pb-8">
      <header>
        <Link
          to="/settings"
          className="mb-3 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} />
          Settings
        </Link>

        <h1 className="text-2xl font-bold text-text">Store settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your store name, address, and business details.
        </p>
      </header>

      {!user ? (
        // 1. Show skeleton if the user object itself hasn't loaded yet
        <StoreFormSkeleton />
      ) : !storeQuery ? (
        // 2. Show error/fallback if user loaded, but has no store data
        <div className="flex items-center gap-2 rounded-card border border-border bg-surface p-4 text-sm text-danger">
          Could not load store details.
          <button
            type="button"
            onClick={() => void refreshUser()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : (
        // 3. Render the form only when storeQuery safely exists
        <StoreForm key={storeQuery.id} store={storeQuery} canEdit={canEdit} />
      )}
    </main>
  );
}
