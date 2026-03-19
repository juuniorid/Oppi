import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header"; // Add this!

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8F9F9]">
        <Header /> {/* Add this! */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}