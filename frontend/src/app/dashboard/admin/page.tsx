import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, LayoutGrid, Calendar, ImageIcon, Plus } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { label: "Kasutajad", value: "166", icon: Users, color: "bg-[#F9E79F]/30 text-yellow-700" },
    { label: "Grupid", value: "6", icon: LayoutGrid, color: "bg-[#A9DFBF]/30 text-green-700" },
    { label: "Puudumisi sel nädalal", value: "48", icon: Calendar, color: "bg-[#AED6F1]/30 text-blue-700" },
    { label: "Pilte kokku", value: "1920", icon: ImageIcon, color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tere, Kadri!</h1>
        <p className="text-gray-500 font-medium italic">Admini paneel ja süsteemi ülevaade</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl p-6 flex flex-col gap-2 bg-white">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white space-y-6">
            <h2 className="text-xl font-black text-gray-900">Viimane aktiivsus</h2>
            <div className="space-y-6">
              {[
                { name: "Rain Müürisepp", role: "Õpetaja", time: "1 min", text: "Postitas uue teate: Päevalille Rühm A" },
                { name: "Liina Rand", role: "Õpetaja", time: "5 min", text: "Lisas 12 uut pilti galeriisse" },
                { name: "Anna", role: "Lapsevanem", time: "12 min", text: "Teavitas Kate'i puudumisest" },
              ].map((user, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-black">{user.name} <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 uppercase">{user.role}</span></p>
                      <span className="text-[10px] text-gray-400 font-bold">{user.time} tagasi</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{user.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
            <h2 className="text-lg font-black text-gray-900 uppercase mb-6">Kutsete haldamine</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-sm font-black text-gray-900 block">Laura Lepik</span>
                <span className="text-xs text-gray-400">laura.lepik@oppi.ee</span>
              </div>
              <Button className="w-full bg-[#F9E79F] text-gray-900 font-black py-6 rounded-2xl hover:bg-[#f7dc6f] border-none shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> SAADA UUS KUTSE
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}