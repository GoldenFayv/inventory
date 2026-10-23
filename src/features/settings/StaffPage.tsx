import { useEffect, useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Search,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRoles } from "./hooks/useRoles";
import {
  useAssignStaffRole,
  useCreateStaff,
  useSetStaffActive,
  useStaff,
} from "./hooks/useStaff";

type ApiValidationErrors = Record<string, string[]>;

function getValidationErrors(error: unknown): ApiValidationErrors {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return {};
  }

  const response = (
    error as {
      response?: {
        data?: {
          errors?: ApiValidationErrors;
        };
      };
    }
  ).response;

  return response?.data?.errors ?? {};
}

export default function StaffPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const staffQuery = useStaff({ search: searchTerm, page });
  const rolesQuery = useRoles();
  const createStaff = useCreateStaff();
  const assignRole = useAssignStaffRole();
  const setActive = useSetStaffActive();

  const staff = staffQuery.data?.data ?? [];
  const pagination = staffQuery.data?.meta;
  const roles = rolesQuery.data ?? [];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const staffErrors = createStaff.isError
    ? getValidationErrors(createStaff.error)
    : {};

  async function handleCreateStaff(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createStaff.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch {
      // The mutation error is displayed below.
    }
  }

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

        <h1 className="text-2xl font-bold text-text">Staff management</h1>
        <p className="mt-1 text-sm text-text-muted">
          Add workers and manage their access to your store.
        </p>
      </header>

      <section className="space-y-4 rounded-card border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <UserPlus size={20} className="text-primary" />
          <h2 className="font-semibold text-text">Add a staff member</h2>
        </div>

        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-text">First name</span>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
                placeholder="First name"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-text">Last name</span>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
                placeholder="Last name"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-text">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
                placeholder="worker@example.com"
              />

              {staffErrors.email?.map((message) => (
                <p key={message} className="text-sm text-danger">
                  {message}
                </p>
              ))}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-text">Phone</span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
                placeholder="Phone number"
              />
              {staffErrors.phone?.map((message) => (
                <p key={message} className="text-sm text-danger">
                  {message}
                </p>
              ))}
            </label>
          </div>

          {/* {createStaff.isError && (
            <p className="text-sm text-danger">
              Could not add staff. Check the details and try again.
            </p>
          )} */}

          {createStaff.isSuccess && (
            <p className="text-sm text-success">Staff member added.</p>
          )}

          <button
            type="submit"
            disabled={createStaff.isPending}
            className="w-full rounded-input bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {createStaff.isPending ? "Adding..." : "Add staff"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <h2 className="font-semibold text-text">Your team</h2>
            <span className="text-sm text-text-muted">
              ({pagination?.total ?? 0})
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search staff..."
              aria-label="Search staff by name, email, or phone"
              className="w-full rounded-input border border-border bg-surface py-2 pl-10 pr-3 text-text placeholder:text-text-muted"
            />
          </div>
        </div>

        {staffQuery.isLoading && (
          <p className="text-sm text-text-muted">Loading staff...</p>
        )}

        {staffQuery.isError && (
          <p className="text-sm text-danger">
            Could not load staff. Please refresh and try again.
          </p>
        )}

        {rolesQuery.isError && (
          <p className="text-sm text-danger">
            Could not load roles. Role assignment is unavailable right now.
          </p>
        )}

        {!staffQuery.isLoading && !staffQuery.isError && staff.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-6 text-center">
            <p className="font-medium text-text">
              {searchTerm ? "No matching staff found" : "No staff members yet"}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {searchTerm
                ? "Try a different name, email, or phone number."
                : "Add a worker using the form above."}
            </p>
          </div>
        )}

        {staff.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {staff.map((member) => {
              const isActive = member.is_active;
              const isUpdatingStatus =
                setActive.isPending &&
                setActive.variables?.staffId === member.user.id;

              return (
                <article
                  key={member.id}
                  className={`space-y-3 rounded-card border border-border bg-surface p-4 ${
                    isActive ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text">
                        {member.user.first_name} {member.user.last_name}
                      </h3>
                      <p className="break-all text-sm text-text-muted">
                        {member.user.email}
                      </p>
                      <p className="text-sm text-text-muted">
                        {member.user.phone || "No phone number"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-text-muted">
                        {isActive}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label={`${isActive ? "Deactivate" : "Activate"} ${
                          member.user.first_name
                        }`}
                        disabled={isUpdatingStatus}
                        onClick={() => {
                          // if (
                          //   isActive &&
                          //   !window.confirm(
                          //     `Deactivate ${member.user.first_name}? They will lose access to this store.`,
                          //   )
                          // ) {
                          //   return;
                          // }

                          setActive.mutate({
                            staffId: member.id,
                          });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          isActive ? "bg-primary" : "bg-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            isActive ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      htmlFor={`role-${member.id}`}
                      className="text-sm font-medium text-text"
                    >
                      Role
                    </label>

                    <select
                      id={`role-${member.id}`}
                      value={member.role?.id ?? ""}
                      disabled={
                        !isActive ||
                        rolesQuery.isLoading ||
                        rolesQuery.isError ||
                        roles.length === 0 ||
                        assignRole.isPending
                      }
                      onChange={async (event) => {
                        const roleId = event.target.value;
                        if (!roleId || roleId === member.role?.id) return;

                        try {
                          await assignRole.mutateAsync({
                            staffId: member.user.id,
                            payload: { role_id: roleId },
                          });
                        } catch {
                          // The mutation error is displayed below.
                        }
                      }}
                      className="w-full rounded-input border border-border bg-background px-3 py-2 text-text disabled:cursor-not-allowed sm:max-w-xs"
                    >
                      <option value="">
                        {member.role?.name ?? "No role assigned"}
                      </option>
                      {roles
                        .filter((role) => role.id !== member.role?.id)
                        .map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {assignRole.isError &&
                    assignRole.variables?.staffId === member.user.id && (
                      <p className="text-sm text-danger">
                        Role assignment failed. Please try again.
                      </p>
                    )}

                  {setActive.isError &&
                    setActive.variables?.staffId === member.user.id && (
                      <p className="text-sm text-danger">
                        Could not update status. Please try again.
                      </p>
                    )}
                </article>
              );
            })}
          </div>
        )}

        {pagination && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Showing {pagination.from ?? 0}–{pagination.to ?? 0} of{" "}
              {pagination.total} staff members
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                disabled={pagination.current_page <= 1 || staffQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="whitespace-nowrap text-sm text-text-muted">
                Page {pagination.current_page} of {pagination.last_page}
              </span>

              <button
                type="button"
                disabled={
                  pagination.current_page >= pagination.last_page ||
                  staffQuery.isFetching
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.last_page, current + 1),
                  )
                }
                className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {roles.length === 0 && !rolesQuery.isLoading && !rolesQuery.isError && (
          <p className="text-sm text-text-muted">
            Create a role in{" "}
            <Link
              to="/settings/roles"
              className="font-medium text-primary underline"
            >
              Roles &amp; permissions
            </Link>{" "}
            before assigning one to a staff member.
          </p>
        )}
      </section>
    </main>
  );
}
