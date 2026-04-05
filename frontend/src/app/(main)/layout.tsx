import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#ebe8e2]">
      <Header />
      <div className="flex min-h-0 flex-1 gap-2 px-2 pt-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-3 md:gap-3 md:pb-3">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-auto rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:rounded-3xl md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
