"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, User, GraduationCap } from "lucide-react";

export function ViewSwitcher() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="rounded-xl h-8 text-[10px] font-black uppercase tracking-tight hover:bg-white"
      >
        <User className="w-3 h-3 mr-1" /> Vanem
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/teacher")}
        className="rounded-xl h-8 text-[10px] font-black uppercase tracking-tight hover:bg-white"
      >
        <GraduationCap className="w-3 h-3 mr-1" /> Õpetaja
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/admin")}
        className="rounded-xl h-8 text-[10px] font-black uppercase tracking-tight hover:bg-white"
      >
        <LayoutGrid className="w-3 h-3 mr-1" /> Admin
      </Button>
    </div>
  );
}