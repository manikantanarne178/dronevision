import { FolderOpen } from "lucide-react";

export default function ProjectInfo() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-6">

        <FolderOpen className="text-cyan-400"/>

        <h2 className="text-xl font-semibold">

          Project Information

        </h2>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="text-slate-400 text-sm">

            Project Name

          </label>

          <input
            placeholder="Building Survey"
            className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 p-3 outline-none"
          />

        </div>

        <div>

          <label className="text-slate-400 text-sm">

            Mission Type

          </label>

          <select
            className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 p-3"
          >

            <option>Survey Mapping</option>

            <option>Construction</option>

            <option>Agriculture</option>

            <option>Mining</option>

          </select>

        </div>

        <div>

          <label className="text-slate-400 text-sm">

            Drone Name

          </label>

          <input
            placeholder="DJI Mavic 3"
            className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 p-3"
          />

        </div>

        <div>

          <label className="text-slate-400 text-sm">

            Altitude

          </label>

          <input
            placeholder="120 m"
            className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 p-3"
          />

        </div>

      </div>

    </div>
  );
}