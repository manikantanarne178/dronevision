import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Processing() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("Uploading Images...");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function generate() {
      try {
        setStatus("Generating Photogrammetry 3D Reconstruction...");

        const response = await API.post("/api/reconstruction/generate");
        const projId = response.data?.project_id;

        setStatus("Reconstruction Finalized...");
        setCompleted(true);

        setTimeout(() => {
          if (projId) {
            navigate(`/viewer/${projId}`);
          } else {
            navigate("/viewer");
          }
        }, 1200);
      } catch (err) {
        console.error("Reconstruction failed:", err);
        alert("3D Reconstruction Generation Failed. Please verify uploaded survey images.");
      }
    }

    generate();
  }, [navigate]);

  return (
    <div className="h-full flex items-center justify-center">

      <div className="bg-slate-900 rounded-3xl p-12 w-[700px] text-center border border-slate-700">

        {!completed ? (
          <>
            <Loader2
              className="animate-spin mx-auto text-cyan-400"
              size={80}
            />

            <h1 className="text-3xl font-bold mt-8">
              Processing Reconstruction
            </h1>

            <p className="text-slate-400 mt-4">
              {status}
            </p>

            <div className="mt-8 h-3 bg-slate-800 rounded-full overflow-hidden">

              <div className="h-full w-full bg-cyan-400 animate-pulse" />

            </div>
          </>
        ) : (
          <>
            <CheckCircle2
              size={90}
              className="mx-auto text-green-500"
            />

            <h1 className="text-3xl font-bold mt-6">
              Reconstruction Completed
            </h1>

            <p className="text-slate-400 mt-3">
              Opening Viewer...
            </p>
          </>
        )}

      </div>

    </div>
  );
}