export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
          Teated
        </h1>
      </div>
      {children}
    </div>
  );
}
