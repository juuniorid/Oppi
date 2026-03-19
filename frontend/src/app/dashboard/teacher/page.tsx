import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, UserX, Image as ImageIcon } from "lucide-react";

const todaysAbsences = [
  { id: 1, name: "Kate", parent: "Maris", reason: "Haigus", color: "bg-red-50 text-red-600" },
  { id: 2, name: "Mikk", parent: "Maris", reason: "Reisimine", color: "bg-blue-50 text-blue-600" },
  { id: 3, name: "Mari", parent: "Siim", reason: "Tuulerõuged", color: "bg-orange-50 text-orange-600" },
];

export default function TeacherPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tere, Rain!</h1>
          <p className="text-gray-500 font-medium italic">Õpetaja vaade</p>
        </div>
        <Button className="bg-[#F9E79F] text-gray-900 font-black px-6 py-3 rounded-2xl hover:bg-[#f7dc6f] border-none shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          LISA UUS TEADE
        </Button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#AED6F1] flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Päevalill Rühm</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase">Rühm A</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F9E79F]/30 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm font-bold text-yellow-900">Täna puudub</span>
                  </div>
                  <span className="text-[10px] text-yellow-700 font-black">02.04.2024</span>
                </div>
                <Button variant="ghost" className="w-full text-xs font-black text-green-600 bg-[#A9DFBF]/20 rounded-xl">
                  15 PUUDUMIST KOKKU &gt;
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 bg-white">
            <h3 className="text-lg font-black text-gray-900 uppercase mb-6">Puudumised täna</h3>
            <div className="space-y-4">
              {todaysAbsences.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${absence.name}`} />
                      <AvatarFallback>CH</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-black text-gray-900">{absence.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{absence.parent}</p>
                    </div>
                  </div>
                  <Badge className={`border-none rounded-xl text-[10px] font-black px-3 py-1 ${absence.color}`}>
                    {absence.reason.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}