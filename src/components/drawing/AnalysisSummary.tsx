import {
  FileText,
  Layers,
  Shapes,
  Square,
  Building2,
} from "lucide-react";

import type { DrawingResponse } from "../../types/drawing";

interface Props {
  result: DrawingResponse;
}

export default function AnalysisSummary({ result }: Props) {
  const cards = [
    {
      title: "Drawing Record",
      value: result.drawing_id ? result.drawing_id.substring(0, 10) + "..." : "--",
      icon: FileText,
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      title: "CAD Layers",
      value: result.parsed_data?.layers ? result.parsed_data.layers.length : 0,
      icon: Layers,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Geometry Entities",
      value: result.parsed_data?.entities ? result.parsed_data.entities.length : 0,
      icon: Shapes,
      color: "text-teal-600 bg-teal-50",
    },
    {
      title: "Site Plot Boundary",
      value: result.plot ? "Detected" : "Not Found",
      icon: Square,
      color: result.plot ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50",
    },
    {
      title: "Building Footprint",
      value: result.building ? "Detected" : "Not Found",
      icon: Building2,
      color: result.building ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <Icon size={16} />
              </div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.title}
              </h3>
            </div>

            <p className="text-lg font-bold text-slate-900 font-mono">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}