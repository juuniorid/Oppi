'use client';

// src/app/dashboard/group/page.tsx
import { useEffect, useState } from 'react';
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Users, Baby, Clock } from "lucide-react";
import { useApi } from '@/hooks/useApi';

const childData = {
  name: "Kate",
  groupName: "Päevalill Rühm - Rühm A",
  teacher: "Rain Müürisepp",
  lastAbsence: "02.04.2024",
  totalAbsences: 13,
  status: "Kohal"
};

interface Child {
  id: number;
  firstName: string;
  lastName: string;
}

export default function GroupPage() {
  const { apiCall } = useApi();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    // Assume groupId is 1 for demo
    apiCall<Child[]>('/children/group/1').then((data) => {
      // Ensure data exists before setting to avoid breaking the map function
      if (data) setChildren(data);
    });
  }, [apiCall]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Minu rühm</h1>
        <p className="text-gray-500">Siin on ülevaade sinu lapse rühmast ja tegevustest.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Child Info Card */}
        <Card className="p-6 space-y-4 border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f9e79f] flex items-center justify-center">
              <Baby className="w-8 h-8 text-yellow-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{childData.name}</h2>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                {childData.status}
              </Badge>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Õpetaja:</span>
              <span className="font-medium">{childData.teacher}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Viimane puudumine:</span>
              <span className="font-medium">{childData.lastAbsence}</span>
            </div>
          </div>
        </Card>

        {/* Group Stats Card */}
        <Card className="p-6 bg-[#aed6f1]/20 border-none space-y-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" />
            <h3 className="font-bold text-blue-900">{childData.groupName}</h3>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Rühm A on sel nädalal keskendunud kevade märkidele looduses ja hommikustele jalutuskäikudele.
          </p>
        </Card>

        {/* Total Absences Card */}
        <Card className="p-6 bg-[#f9e79f]/30 border-none flex flex-col justify-center items-center text-center">
          <Clock className="w-8 h-8 text-yellow-700 mb-2" />
          <span className="text-4xl font-black text-yellow-800">{childData.totalAbsences}</span>
          <p className="text-sm font-medium text-yellow-900 uppercase tracking-wide">Puudumist kokku</p>
        </Card>
      </div>

      {/* Rendered Children List from API */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Rühma lapsed</h2>
        <Card className="p-6 border-gray-100">
          {children.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {children.map((child) => (
                <li key={child.id} className="py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {child.firstName[0]}{child.lastName[0]}
                  </div>
                  <span className="font-medium text-gray-900">
                    {child.firstName} {child.lastName}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Laen andmeid...</p>
          )}
        </Card>
      </section>
    </div>
  );
}