import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../app/AuthProvider";

export default function StoreRequiredRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">Checking your store...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasStore =
    Boolean(user.store_user) || Boolean(user.other_stores?.length);

  if (!hasStore) {
    return <Navigate to="/create-store" replace />;
  }

  return <Outlet />;
}
