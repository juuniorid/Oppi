// src/app/dashboard/group/page.tsx
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Users, Baby, Clock } from "lucide-react";

const childdata = {
  name: "Kate",
  groupName: "Päevalill Rühm - Rühm A",
  teacher: "Rain Müürisepp",
  lastAbsence: "02.04.2024",
  totalAbsences: 13,
  status: "Kohal"
};

export default function grouppage() {
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
              <h2 className="text-xl font-bold">{childdata.name}</h2>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                {childdata.status}
              </Badge>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Õpetaja:</span>
              <span className="font-medium">{childdata.teacher}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Viimane puudumine:</span>
              <span className="font-medium">{childdata.lastAbsence}</span>
            </div>
          </div>
        </Card>

        {/* Group Stats Card */}
        <Card className="p-6 bg-[#aed6f1]/20 border-none space-y-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" />
            <h3 className="font-bold text-blue-900">{childdata.groupName}</h3>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Rühm A on sel nädalal keskendunud kevade märkidele looduses ja hommikustele jalutuskäikudele.
          </p>
        </Card>

        {/* Total Absences Card */}
        <Card className="p-6 bg-[#f9e79f]/30 border-none flex flex-col justify-center items-center text-center">
          <Clock className="w-8 h-8 text-yellow-700 mb-2" />
          <span className="text-4xl font-black text-yellow-800">{childdata.totalAbsences}</span>
          <p className="text-sm font-medium text-yellow-900 uppercase tracking-wide">Puudumist kokku</p>
        </Card>
      </div>
    </div>
  );
}