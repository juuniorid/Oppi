import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#ebe8e2]">
      <Header />
      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-3 pt-0">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-auto rounded-3xl bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
