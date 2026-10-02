import { UploadCloud, FileCode } from "lucide-react";

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
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {/* Drop Zone */}
        <label
          className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-cyan-50/20 p-6 text-center"
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

          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud size={28} />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            Select or Drag DXF CAD Drawing
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            AutoCAD Drawing Exchange Format (.dxf) containing site boundary, building footprint and setbacks
          </p>
        </label>

        {/* Selected File */}
        {file && (
          <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  {file.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={upload}
            disabled={!file}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud size={16} />
            <span>Process & Scrutinize CAD Drawing</span>
          </button>
        </div>
      </div>
    </div>
  );
}