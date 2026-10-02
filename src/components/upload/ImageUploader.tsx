import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, FileCheck, ShieldCheck } from "lucide-react";

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
      className={`rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer bg-white ${
        isDragActive
          ? "border-cyan-500 bg-cyan-50/50 scale-[1.005]"
          : "border-slate-300 hover:border-cyan-500 hover:bg-slate-50/60"
      }`}
    >
      <input id="imageInput" {...getInputProps()} />

      <div className="py-14 px-6 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mx-auto shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mt-5">
          Select or Drag Aerial Drone Imagery
        </h2>

        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Upload geotagged JPG, PNG, or TIFF files with at least 60% overlap for high-precision photogrammetry reconstruction.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white transition px-5 py-2.5 rounded-xl font-medium text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Browse Files
        </button>

        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            JPG / JPEG
          </span>
          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            PNG
          </span>
          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            TIFF (GeoTIFF)
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> EXIF Geotags Preserved
          </span>
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-cyan-500" /> Max 2GB per batch
          </span>
        </div>
      </div>
    </div>
  );
}