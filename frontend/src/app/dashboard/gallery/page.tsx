import React from "react";
import { Card } from "@/components/ui/card";
import { ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Galerii</h1>
          <p className="text-gray-500 font-medium italic">Viimased hetked ja tegevused</p>
        </div>
        <Button className="bg-[#A9DFBF] text-green-900 font-black px-6 py-3 rounded-2xl hover:bg-[#82e0aa] border-none shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> LISA PILDID
        </Button>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="aspect-square border-none shadow-sm rounded-[2rem] overflow-hidden group cursor-pointer relative">
            <img
              src={`https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&sig=${i}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt="Tegevus"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="text-white w-8 h-8" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}