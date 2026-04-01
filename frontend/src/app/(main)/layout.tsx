import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
          Oppi
        </Link>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
