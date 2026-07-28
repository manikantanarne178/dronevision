import { useEffect, useState } from "react";
import axios from "axios";

import {
  Image,
  Box,
  FolderOpen,
  HardDrive,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";

const API = "http://127.0.0.1:8000";

interface Project {
  project_id: string;
  images_uploaded: number;
  model_url: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

const loadProjects = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API}/api/projects/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.success) {
      setProjects(res.data.projects);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const totalProjects = projects.length;

  const totalImages = projects.reduce(
    (sum, p) => sum + (p.images_uploaded || 0),
    0
  );

  const totalModels = projects.filter(
    (p) => p.model_url
  ).length;

  // Temporary until backend sends storage
  const storage = `${(totalModels * 0.85).toFixed(1)} GB`;

  return (
    <div>

      <div className="grid grid-cols-4 gap-6">

        <StatCard
          title="Projects"
          value={loading ? "..." : totalProjects.toString()}
          icon={FolderOpen}
        />

        <StatCard
          title="Images"
          value={loading ? "..." : totalImages.toString()}
          icon={Image}
        />

        <StatCard
          title="3D Models"
          value={loading ? "..." : totalModels.toString()}
          icon={Box}
        />

        <StatCard
          title="Storage"
          value={loading ? "..." : storage}
          icon={HardDrive}
        />

      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-800 p-6">

        <h2 className="text-2xl font-bold">
          Welcome to DroneVision
        </h2>

        <p className="text-slate-400 mt-3 leading-7">
          Upload drone images, generate high-quality 3D models,
          analyze measurements, calculate area, volume, and
          export professional reports.
        </p>

      </div>

    </div>
  );
}