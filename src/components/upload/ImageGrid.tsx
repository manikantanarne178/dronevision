import { Trash2, Image as ImageIcon } from "lucide-react";

interface Props {
  files: File[];
  removeFile: (index: number) => void;
}

export default function ImageGrid({
  files,
  removeFile,
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
      {files.map((file, index) => {
        const url = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="group relative rounded-lg overflow-hidden bg-slate-50 border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition-all duration-200"
          >
            <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
              <img
                src={url}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => URL.revokeObjectURL(url)}
              />
              <button
                onClick={() => removeFile(index)}
                type="button"
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 hover:bg-rose-500 text-slate-600 hover:text-white border border-slate-200/50 shadow-xs transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2 bg-white">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <h3 className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}