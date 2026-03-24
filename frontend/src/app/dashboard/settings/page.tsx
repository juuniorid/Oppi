import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seaded</h1>
        <p className="text-gray-500 font-medium">Halda oma profiili ja teavituste eelistusi.</p>
      </section>

      <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
        <CardContent className="p-0 space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Profiil</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none ring-2 ring-transparent focus:ring-[#f9e79f] transition-all"
              placeholder="Eesnimi"
            />
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none ring-2 ring-transparent focus:ring-[#f9e79f] transition-all"
              placeholder="Perenimi"
            />
          </div>
          <input
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none ring-2 ring-transparent focus:ring-[#f9e79f] transition-all"
            placeholder="E-post"
            type="email"
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
        <CardContent className="p-0 space-y-5">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Teavitused</h2>
          </div>
          <label className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">E-posti teavitused</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-gray-900" />
          </label>
          <label className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Brauseri teavitused</span>
            <input type="checkbox" className="w-4 h-4 accent-gray-900" />
          </label>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Turvalisus</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-gray-900 text-white font-bold py-6 rounded-2xl hover:bg-black border-none">
              Salvesta muudatused
            </Button>
            <Button variant="outline" className="font-bold py-6 rounded-2xl">
              Vaheta parool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
