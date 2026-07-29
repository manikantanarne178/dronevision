import { UploadCloud, FileText } from "lucide-react";
// import AnalysisSummary from "../drawing/AnalysisSummary";

interface Props {
  file: File | null;
  setFile: (file: File | null) => void;
  upload: () => void;
}

export default function UploadCard({
  file,
  setFile,
  upload,
}: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Card */}
      <div className="bg-[#161f33] rounded-2xl border border-slate-700 shadow-xl p-8">

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <UploadCloud size={36} className="text-cyan-400" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">
              Upload DXF Drawing
            </h2>

            <p className="text-slate-400 mt-1">
              Select a DXF drawing for AutoDCR analysis.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <label
          className="
          border-2
          border-dashed
          border-cyan-500/40
          rounded-xl
          h-72
          flex
          flex-col
          items-center
          justify-center
          cursor-pointer
          transition
          hover:border-cyan-400
          hover:bg-cyan-500/5
        "
        >
          <input
            hidden
            type="file"
            accept=".dxf"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFile(e.target.files[0]);
              }
            }}
          />

          <UploadCloud size={70} className="text-cyan-400 mb-4" />

          <h3 className="text-2xl font-semibold text-white">
            Drag & Drop DXF File
          </h3>

          <p className="text-slate-400 mt-2">
            or click to browse your computer
          </p>
        </label>

        {/* Selected File */}
        {file && (
          <div className="mt-6 bg-[#1b2742] rounded-xl border border-slate-700 p-5 flex items-center gap-4">

            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <FileText className="text-cyan-400" size={28} />
            </div>

            <div className="flex-1">
              <h4 className="text-white font-semibold">
                {file.name}
              </h4>

              <p className="text-slate-400 text-sm">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={upload}
          disabled={!file}
          className="
          mt-8
          w-full
          h-14
          rounded-xl
          bg-cyan-500
          hover:bg-cyan-400
          disabled:bg-slate-700
          disabled:cursor-not-allowed
          text-lg
          font-semibold
          text-white
          transition
        "
        >
          Upload Drawing
        </button>
      </div>

      {/* Analysis Summary */}
      {/* <div className="mt-8">
        <AnalysisSummary />
      </div> */}
    </div>
  );
}