import { useEffect, useState } from "react";
import API from "../api";
import "./Reports.css";

import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Trash2,
} from "lucide-react";

// const API = "http://127.0.0.1:8000";

interface Project {
  project_id: string;
  generated_at: string;
  processing_time: number;
  images_uploaded: number;

  width: number;
  length: number;
  height: number;

  ground_area: number;
  surface_area: number;
  volume: number;

  vertices: number;
  triangles: number;

  model_url: string;
  report_url: string;
}

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

const loadProjects = async () => {
  try {
    const res = await API.get("/api/projects/");

    if (res.data.success) {
      setProjects(res.data.projects);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const deleteProject = async (projectId: string) => {
  if (!window.confirm("Are you sure you want to delete this project?")) {
    return;
  }

  try {
    await API.delete(`/api/projects/${projectId}`);

    setProjects((prev) =>
      prev.filter((p) => p.project_id !== projectId)
    );

    alert("Project deleted successfully.");
  } catch (err) {
    console.error(err);
    alert("Failed to delete project.");
  }
};
const downloadReport = async (reportUrl: string) => {
  try {
    const response = await API.get(reportUrl, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="reports-page">
      <h1>Reports</h1>

      <p className="subtitle">
        Download generated drone reconstruction reports
      </p>

      <div className="report-summary">
        <div className="summary-card">
          <BarChart3 size={28} />
          <h2>{projects.length}</h2>
          <span>Total Reports</span>
        </div>

        <div className="summary-card">
          <Calendar size={28} />
          <h2>{projects.length}</h2>
          <span>Available</span>
        </div>
      </div>

      <div className="report-list">
        {loading && <p>Loading projects...</p>}

        {!loading && projects.length === 0 && (
          <p>No reports found.</p>
        )}

        {!loading &&
          projects.map((project) => (
            <div className="report-card" key={project.project_id}>
              <div className="left">
                <FileText size={30} />

                <div>
                  <h3>{project.project_id}</h3>

                  <p>
                    {project.generated_at
                      ? new Date(
                          project.generated_at
                        ).toLocaleString()
                      : "-"}
                  </p>

                  <small>
                    {project.images_uploaded} Images •{" "}
                    {project.processing_time}s
                  </small>

                  <small>
                    <br />
                    {project.width?.toFixed(2)}m ×{" "}
                    {project.length?.toFixed(2)}m ×{" "}
                    {project.height?.toFixed(2)}m
                  </small>
                </div>
              </div>

              <div className="right">
                <span className="done">
                  Completed
                </span>

                <button
                  onClick={() =>
                    downloadReport(project.report_url)
                  }
                >
                  <Download size={18} />
                  Download
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteProject(project.project_id)
                  }
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}