import { useEffect, useState } from "react";

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
    fetch("http://127.0.0.1:8000/api/analytics")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        return res.json();
      })
      .then((json) => {
        console.log("Analytics:", json);
        setData(json);
      })
      .catch(console.error);
  }, []);

  return data;
}