import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image } from "lucide-react";

interface Props {
  onFilesSelected: (files: File[]) => void;
}

export default function ImageUploader({ onFilesSelected }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/tiff": [],
    },
    multiple: true,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
      ${
        isDragActive
          ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
          : "border-slate-700 bg-slate-900 hover:border-cyan-400 hover:bg-slate-800"
      }`}
    >
      <input
        id="imageInput"
        {...getInputProps()}
      />

      <div className="py-20 px-10 text-center">

        <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">
          <UploadCloud
            size={50}
            className="text-cyan-400"
          />
        </div>

        <h2 className="text-3xl font-bold mt-8">
          Drag & Drop Drone Images
        </h2>

        <p className="text-slate-400 mt-4">
          Upload high-quality aerial survey images for 3D reconstruction
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="mt-8 bg-cyan-500 hover:bg-cyan-600 transition px-8 py-3 rounded-xl font-semibold shadow-lg shadow-cyan-500/30"
        >
          Browse Images
        </button>

        <div className="flex justify-center gap-3 mt-8 flex-wrap">

          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <Image size={16} />
            JPG
          </span>

          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <Image size={16} />
            PNG
          </span>

          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <Image size={16} />
            TIFF
          </span>

        </div>

        <p className="text-slate-500 text-sm mt-8">
          Drag images anywhere inside this box or click{" "}
          <span className="text-cyan-400 font-medium">
            Browse Images
          </span>{" "}
          to select files.
        </p>

      </div>
    </div>
  );
}