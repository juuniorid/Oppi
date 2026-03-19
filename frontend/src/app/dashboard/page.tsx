import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMinus, Image as ImageIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tere, Anna!</h1>
        <p className="text-gray-500 font-medium">Esmaspäev, 3. juuni</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none bg-[#f9e79f] rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/50 rounded-2xl">
                  <UserMinus className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Kate - Rühm A</h3>
                  <p className="text-sm text-yellow-800 font-bold opacity-80">13 puudumist kokku</p>
                </div>
              </div>
            </Card>

            <Card className="border-none bg-[#a9dfbf] rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/50 rounded-2xl">
                  <ImageIcon className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Viimased pildid</h3>
                  <p className="text-sm text-green-800 font-bold opacity-80">Vaata uusi hetki</p>
                </div>
              </div>
            </Card>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 px-2">Viimased teated</h2>
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rain" />
                  <AvatarFallback>RM</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-gray-900 italic">Rain Müürisepp</h4>
                    <span className="text-xs text-gray-400">10:30</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Hommikune jalutuskäik ja mängupark läks täna väga hästi. Lapsed leidsid esimesed kevadlilled...
                  </p>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-500 border-none font-bold text-[10px] mt-2">
                    RÜHM A
                  </Badge>
                </div>
              </div>
            </Card>
          </section>
        </div>

        <aside className="lg:col-span-4 sticky top-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] p-4 bg-white ring-1 ring-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-gray-900">Teavita puudumisest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vali laps</label>
                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer">
                  <option>Kate</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Põhjus</label>
                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer">
                  <option>Vali põhjus</option>
                  <option>Haigus</option>
                  <option>Puhkus</option>
                </select>
              </div>
              <Button className="w-full bg-gray-900 text-white font-black py-6 rounded-2xl hover:bg-black transition-all shadow-lg border-none">
                SAADA TEAVITUS
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}