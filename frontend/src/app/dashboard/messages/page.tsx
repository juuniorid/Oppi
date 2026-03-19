import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";

export default function MessagesPage() {
  const chats = [
    { id: 1, name: "Päevalill Rühm - Rühm A", last: "Näeme varsti kevadepeol!", time: "10:30", active: true },
    { id: 2, name: "Rain Müürisepp", last: "Lisan pildid jalutuskäigust.", time: "Eile", active: false },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Vasak paneel: Vestlused */}
      <Card className="w-80 border-none shadow-sm rounded-[2rem] bg-white flex flex-col overflow-hidden">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">Vestlused</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 text-sm outline-none" placeholder="Otsi..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {chats.map((chat) => (
            <div key={chat.id} className={`p-4 rounded-2xl mb-2 cursor-pointer transition-all ${chat.active ? 'bg-[#F9E79F]/30' : 'hover:bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <p className="text-sm font-black text-gray-900 truncate pr-2">{chat.name}</p>
                <span className="text-[10px] text-gray-400 font-bold">{chat.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-1">{chat.last}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Parem paneel: Sõnumiaken */}
      <Card className="flex-1 border-none shadow-sm rounded-[2.5rem] bg-white flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <Avatar className="w-10 h-10 ring-2 ring-yellow-100">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=group" />
            <AvatarFallback>PR</AvatarFallback>
          </Avatar>
          <h3 className="font-black text-gray-900">Päevalill Rühm - Rühm A</h3>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-gray-50/30">
          <div className="flex gap-3 max-w-[80%]">
            <Avatar className="w-8 h-8 self-end"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rain" /></Avatar>
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm">
              <p className="text-[10px] font-black text-yellow-700 uppercase mb-1">Rain Müürisepp</p>
              <p className="text-sm text-gray-700">Tere! Homme toimub meil väike kevade tervitamine õues.</p>
            </div>
          </div>
          <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
            <div className="bg-gray-900 text-white p-4 rounded-2xl rounded-br-none shadow-lg">
              <p className="text-sm">Suur tänu info eest! Oleme kohal.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <input className="flex-1 bg-transparent border-none outline-none px-4 text-sm" placeholder="Kirjuta sõnum siia..." />
            <Button className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition-all h-10 w-10">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}