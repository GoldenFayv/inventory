import { useMemo, useState } from "react";
import { AlertCircle, Plus, ShieldCheck } from "lucide-react";
import { useCreateRole, usePermissions, useRoles } from "./hooks/useRoles";

export default function RolesPage() {
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissions();
  const createRole = useCreateRole();

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const permissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery],
  );
  const roles = rolesQuery.data ?? [];

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, typeof permissions>>(
      (groups, permission) => {
        const category = permission.category || "Other";
        (groups[category] ??= []).push(permission);
        return groups;
      },
      {},
    );
  }, [permissions]);

  function togglePermission(id: string) {
    setSelectedPermissions((current) =>
      current.includes(id)
        ? current.filter((permissionId) => permissionId !== id)
        : [...current, id],
    );
  }

  async function handleCreateRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      await createRole.mutateAsync({
        name: trimmedName,
        permission_ids: selectedPermissions,
      });

      setName("");
      setSelectedPermissions([]);
      setShowForm(false);
    } catch {
      // Mutation error is displayed below the form.
    }
  }

  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Roles &amp; permissions
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Control what workers can access and do in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={18} />
          Create role
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreateRole}
          className="space-y-5 rounded-card border border-border bg-surface p-4 md:p-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-text">Create a role</h2>
            <p className="mt-1 text-sm text-text-muted">
              Choose a name and select the permissions this role should have.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="role-name"
              className="text-sm font-medium text-text"
            >
              Role name
            </label>
            <input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={255}
              placeholder="e.g. Sales Assistant"
              className="w-full rounded-input border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-text">Permissions</h3>
              <p className="text-sm text-text-muted">
                {selectedPermissions.length} selected
              </p>
            </div>

            {permissionsQuery.isPending ? (
              <p className="text-sm text-text-muted">Loading permissions...</p>
            ) : permissionsQuery.isError ? (
              <p className="text-sm text-danger">
                Could not load permissions. Please try again.
              </p>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-text-muted">
                No permissions are available.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(
                  ([category, categoryPermissions]) => (
                    <section
                      key={category}
                      className="rounded-input border border-border p-3"
                    >
                      <h4 className="mb-3 text-sm font-semibold text-text">
                        {category}
                      </h4>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {categoryPermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-start gap-3"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(
                                permission.id,
                              )}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-1 h-4 w-4 accent-primary"
                            />

                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-text">
                                {permission.description || permission.name}
                              </span>
                              {permission.description &&
                                permission.description !== permission.name && (
                                  <span className="block wrap-break-word text-xs text-text-muted">
                                    {permission.name}
                                  </span>
                                )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ),
                )}
              </div>
            )}
          </div>

          {createRole.isError && (
            <p role="alert" className="text-sm text-danger">
              Could not create the role. Check the name and try again.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setSelectedPermissions([]);
                createRole.reset();
              }}
              className="rounded-input border border-border px-4 py-2.5 text-sm font-medium text-text"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createRole.isPending ||
                !name.trim() ||
                permissionsQuery.isPending ||
                permissionsQuery.isError
              }
              className="rounded-input bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createRole.isPending ? "Creating..." : "Save role"}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-text">Your roles</h2>
          <p className="text-sm text-text-muted">
            {roles.length} {roles.length === 1 ? "role" : "roles"} available
          </p>
        </div>

        {rolesQuery.isPending ? (
          <div className="rounded-card border border-border bg-surface p-6 text-sm text-text-muted">
            Loading roles...
          </div>
        ) : rolesQuery.isError ? (
          <div className="flex items-center gap-2 rounded-card border border-border bg-surface p-4 text-sm text-danger">
            <AlertCircle size={18} />
            Could not load roles.
            <button
              type="button"
              onClick={() => void rolesQuery.refetch()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
            <ShieldCheck className="mx-auto mb-3 text-text-muted" size={32} />
            <h3 className="font-semibold text-text">No roles yet</h3>
            <p className="mt-1 text-sm text-text-muted">
              Create a role to define what your staff can do.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <article
                key={role.id}
                className="rounded-card border border-border bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-primary-light text-primary">
                    <ShieldCheck size={21} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="wrap-break-word font-semibold text-text">
                      {role.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {role.permissions?.length ?? 0} permissions
                    </p>
                  </div>
                </div>

                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id}
                        className="rounded-full bg-background px-2.5 py-1 text-xs text-text-muted"
                      >
                        {permission.description || permission.name}
                      </span>
                    ))}

                    {role.permissions.length > 3 && (
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs text-text-muted">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
