import { useEffect, useState } from "react";
import API from "../api";

export interface Analytics {
  file: string;

  vertices: number;
  triangles: number;

  surface_area: number;
  ground_area: number;
  volume: number;

  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

export default function useAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    API.get("/api/analytics")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.warn("Analytics endpoint unavailable or requires project scope:", err);
      });
  }, []);

  return data;
}