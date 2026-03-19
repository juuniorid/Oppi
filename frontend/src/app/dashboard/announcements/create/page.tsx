import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ChevronLeft, Send } from "lucide-react";
import Link from "next/link";

export default function CreateAnnouncementPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/teacher" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> TAGASI
      </Link>

      <section>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lisa uus teade [cite: 246]</h1>
        <p className="text-gray-500 font-medium">Teade saadetakse kõigile rühma vanematele.</p>
      </section>

      <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
        <CardContent className="p-0 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teate pealkiri</label>
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-[#f9e79f] transition-all"
              placeholder="nt. Homne pildistamine"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sisu [cite: 248]</label>
            <textarea
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none ring-2 ring-transparent focus:ring-[#f9e79f] transition-all min-h-[200px] resize-none"
              placeholder="Kirjuta teate sisu siia..."
            />
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-[#f9e79f] text-gray-900 font-black py-6 rounded-2xl hover:bg-[#f7dc6f] border-none shadow-lg">
              <Send className="w-4 h-4 mr-2" /> POSTITA TEADE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}