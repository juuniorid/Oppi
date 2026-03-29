'use client';

import React from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9F9] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 space-y-4">
        <div className="mx-auto bg-[#F9E79F] w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg">
          <BookOpen className="w-10 h-10 text-yellow-700" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Oppi</h1>
        <p className="text-gray-500 font-medium max-w-[280px] mx-auto">
          Kaasaegne ja kasutajasõbralik platvorm lasteaedadele
        </p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-2xl rounded-[3rem] p-10 bg-white">
        <h2 className="text-xl font-bold mb-8">Tere tulemast tagasi!</h2>

        <Button
          onClick={handleGoogleLogin}
          className="w-full py-8 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-3 transition-all"
        >
          <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} unoptimized />
          Logi sisse Google&apos;iga
        </Button>

        <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Liitumine kutse- või rühmakoodiga
        </p>
      </Card>

      <p className="mt-12 text-sm text-gray-400 font-medium">
        Oppi kehittyy — me kasvame koos
      </p>
    </div>
  );
}