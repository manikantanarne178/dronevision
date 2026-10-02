import { FolderKanban } from "lucide-react";

export default function ProjectInfo() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
          <FolderKanban className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Survey Project Metadata
          </h2>
          <p className="text-xs text-slate-500">
            Specify survey mission parameters for spatial reference calibration.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Project Name
          </label>
          <div className="relative">
            <input
              defaultValue="Ward-4 Municipal Aerial Survey"
              placeholder="e.g. Sector 12 Topography"
              className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mission Classification
          </label>
          <div className="relative">
            <select
              className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option>Urban Infrastructure Scrutiny</option>
              <option>Building Code Compliance</option>
              <option>Topographic Survey & DSM</option>
              <option>Disaster & Encroachment Monitoring</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            UAV / Drone Model
          </label>
          <div className="relative">
            <input
              defaultValue="DJI Matrice 300 RTK"
              placeholder="e.g. DJI Mavic 3 Enterprise"
              className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Flight Altitude (AGL)
          </label>
          <div className="relative">
            <input
              defaultValue="120 m"
              placeholder="e.g. 120 m"
              className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}