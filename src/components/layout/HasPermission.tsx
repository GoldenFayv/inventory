import React from "react";
import { useAuth } from "../../app/AuthProvider";

interface CanProps {
  to: string;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional: what to render if the user lacks permission
}

export const HasPermission: React.FC<CanProps> = ({
  to: permission,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();
  const permissions = user?.store_user?.permissions ?? [];

  const hasPermission = permissions.some((item) => item.name === permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
