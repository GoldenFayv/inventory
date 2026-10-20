export default function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      {[0, 1].map((key) => (
        <div
          key={key}
          className="space-y-4 rounded-card border border-border bg-surface p-4 md:p-6"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-background" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-11 animate-pulse rounded-input bg-background" />
            <div className="h-11 animate-pulse rounded-input bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
