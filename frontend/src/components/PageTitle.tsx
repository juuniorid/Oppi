export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-xl md:text-3xl font-bold text-gray-900 ml-2 mb-6">
      {children}
    </h1>
  );
}
