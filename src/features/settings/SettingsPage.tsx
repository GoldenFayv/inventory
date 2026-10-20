import { Link } from "react-router-dom";
import { Store, Users, ShieldCheck, ChevronRight, Lock } from "lucide-react";

const settingsItems = [
  {
    title: "Store settings",
    description: "Manage your store name, address, and business details.",
    icon: Store,
    to: "/settings/store",
  },
  {
    title: "Staff management",
    description: "Add workers and manage who has access to your store.",
    icon: Users,
    to: "/settings/staff",
  },
  {
    title: "Roles & permissions",
    description: "Create roles and control what staff members can do.",
    icon: ShieldCheck,
    to: "/settings/roles",
  },
  {
    title: "Profile & security",
    description: "Update your details and change your password.",
    icon: Lock,
    to: "/settings/profile",
  },
];

export default function SettingsPage() {
  return (
    <main className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your store and team access.
        </p>
      </header>

      <section className="space-y-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition hover:bg-background"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input bg-primary-light text-primary">
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-text">{item.title}</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {item.description}
                </p>
              </div>

              <ChevronRight size={20} className="shrink-0 text-text-muted" />
            </Link>
          );
        })}
      </section>
    </main>
  );
}
