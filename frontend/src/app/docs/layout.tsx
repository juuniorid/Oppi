export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
