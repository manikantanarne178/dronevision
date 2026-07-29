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
      title: "Drawing ID",
      value: result.drawing_id.substring(0, 8) + "...",
      icon: FileText,
    },
    {
      title: "Layers",
      value: result.parsed_data.layers.length,
      icon: Layers,
    },
    {
      title: "Entities",
      value: result.parsed_data.entities.length,
      icon: Shapes,
    },
    {
      title: "Plot",
      value: result.plot ? "Detected" : "Not Detected",
      icon: Square,
    },
    {
      title: "Building",
      value: result.building ? "Detected" : "Not Detected",
      icon: Building2,
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="summary-card"
          >
            <Icon
              size={32}
              className="text-cyan-400"
            />

            <h3>{card.title}</h3>

            <p>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}