import React from "react";
import { Search, Bell } from "lucide-react";
import { ViewSwitcher } from "./view-switcher";

export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="relative w-64">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border-none text-gray-900 text-sm rounded-2xl block w-full pl-10 p-2.5 outline-none ring-1 ring-transparent focus:ring-[#f9e79f] transition-all"
          placeholder="Otsi"
        />
      </div>

      <ViewSwitcher />

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profiil"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}