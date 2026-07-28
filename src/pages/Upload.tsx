import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ImageUploader from "../components/upload/ImageUploader";
import ImageGrid from "../components/upload/ImageGrid";
import ProjectInfo from "../components/upload/ProjectInfo";
import ProjectSummary from "../components/upload/ProjectSummary";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

const generateModel = async () => {
  if (files.length === 0) {
    alert("Please upload images first.");
    return;
  }

  try {
    setUploading(true);

const token = localStorage.getItem("token");

console.log("TOKEN FROM LOCAL STORAGE:", token);
console.log("AUTH HEADER:", `Bearer ${token}`);

const formData = new FormData();

files.forEach((file) => {
  formData.append("files", file);
});

console.log("Uploading images...");

    await axios.post(
      "http://127.0.0.1:8000/api/upload/images",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Generating 3D Model...");

    const response = await axios.post(
      "http://127.0.0.1:8000/api/reconstruction/generate",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    const projectId = response.data.project_id;

    if (!projectId) {
      alert("Project ID not returned by backend.");
      return;
    }

    navigate(`/viewer/${projectId}`);

  } catch (error: any) {
    console.error(error);

    if (error.response?.data?.detail) {
      alert(error.response.data.detail);
    } else {
      alert("3D reconstruction failed. Please check your uploaded images.");
    }
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-4xl font-bold">
        Upload Drone Images
      </h1>

      <p className="text-slate-400 mt-2 mb-8">
        Upload aerial survey images for 3D reconstruction.
      </p>

      <ProjectInfo />

      <div className="mt-8">
        {files.length === 0 && (
          <ImageUploader
            onFilesSelected={(newFiles) =>
              setFiles((prev) => [...prev, ...newFiles])
            }
          />
        )}
      </div>

      {files.length > 0 && (
        <>
          <ProjectSummary files={files} />

          <div className="flex justify-between items-center mt-10">

            <h2 className="text-2xl font-bold">
              Selected Images ({files.length})
            </h2>

            <button
              onClick={() => setFiles([])}
              className="text-red-400 hover:text-red-500"
            >
              Clear All
            </button>

          </div>

          <ImageGrid
            files={files}
            removeFile={(index) =>
              setFiles(files.filter((_, i) => i !== index))
            }
          />

          <button
            onClick={() =>
              document.getElementById("imageInput")?.click()
            }
            className="border border-cyan-500 hover:bg-cyan-500/10 px-6 py-3 rounded-xl mt-6"
          >
            + Add More Images
          </button>

          {/* {files.length < 10 && (
            <div className="mt-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
              <p className="text-yellow-300">
                Upload at least <b>10 overlapping drone images</b> for
                accurate 3D reconstruction.
              </p>

              <p className="text-sm text-slate-400 mt-2">
                Current Images: <b>{files.length}</b> / 10
              </p>
            </div>
          )} */}

          <div className="flex justify-end mt-10">

            <button
              onClick={generateModel}
             disabled={uploading || files.length === 0}
              className="
                bg-cyan-500
                hover:bg-cyan-600
                disabled:bg-slate-700
                disabled:cursor-not-allowed
                px-10
                py-4
                rounded-xl
                font-semibold
                text-lg
                transition-all
              "
            >
              {uploading
                ? "Generating 3D Model..."
                : `Generate 3D Model (${files.length} Images)`}
            </button>

          </div>
        </>
      )}
    </div>
  );
}