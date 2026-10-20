import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../app/AuthProvider";
import { SubscriptionStatus } from "../../enum";
import { useState } from "react";

export default function SubscriptionRequiredRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const [now] = useState(() => Date.now());

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">Checking your subscription...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const subscription = user.store_user?.subscription;

  const validStatus =
    subscription?.status === SubscriptionStatus.Active ||
    subscription?.status === SubscriptionStatus.Trialing;

  const notExpired =
    subscription?.ends_at != null &&
    new Date(subscription.ends_at).getTime() > now;

  if (now === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">Checking your subscription...</p>
      </main>
    );
  }

  if (!validStatus || !notExpired) {
    // alert(8)
    return <Navigate to="/subscription" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
