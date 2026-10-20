import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "../../app/AuthProvider";
import PasswordForm from "./component/PasswordForm";
import ProfileForm from "./component/ProfileForm";
import ProfileSkeleton from "./component/ProfileSkeleton";

export default function ProfilePage() {
  const { user } = useAuth();

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

        <h1 className="text-2xl font-bold text-text">Profile &amp; security</h1>
        <p className="mt-1 text-sm text-text-muted">
          Update your personal details and change your password.
        </p>
      </header>

      {!user ? (
        <ProfileSkeleton />
      ) : (
        <>
          <ProfileForm key={user.id} user={user} />
          <PasswordForm />
        </>
      )}
    </main>
  );
}
