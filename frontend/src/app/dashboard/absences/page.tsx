import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function AbsencesPage() {
  // Näidisandmed kalendri jaoks
  const days = Array.from({ length: 30 }, (_, i) => ({
    date: i + 1,
    status: i === 5 || i === 12 ? "absent" : "present",
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Puudumised</h1>
          <p className="text-gray-500 font-medium italic">Kate'i kohalolu graafik [cite: 179]</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700 border-none">Kohal</Badge>
          <Badge className="bg-red-100 text-red-600 border-none">Puudub</Badge>
        </div>
      </section>

      {/* Kalendri vaade  */}
      <Card className="border-none shadow-sm rounded-[2rem] p-8 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Juuni 2024</h2>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 text-center">
          {["E", "T", "K", "N", "R", "L", "P"].map(d => (
            <span key={d} className="text-[10px] font-black text-gray-400 uppercase">{d}</span>
          ))}
          {days.map(d => (
            <div
              key={d.date}
              className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all cursor-pointer
                ${d.status === "present" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
            >
              {d.date}
            </div>
          ))}
        </div>
      </Card>

      {/* Eventide info kalendri all [cite: 189-190] */}
      <Card className="border-none shadow-sm rounded-3xl p-6 bg-blue-50/30">
        <h3 className="font-bold text-blue-900 mb-2">Päeva info: 3. juuni</h3>
        <p className="text-sm text-blue-700 font-medium">Laps oli kohal. Toimus hommikune jalutuskäik ja joonistamine.</p>
      </Card>
    </div>
  );
}