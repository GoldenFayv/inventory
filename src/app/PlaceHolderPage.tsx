export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-text-muted">This section is under development.</p>
    </section>
  );
}
