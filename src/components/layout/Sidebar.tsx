import {
  LayoutDashboard,
  Upload,
  Box,
  FileText,
  Settings,
  Drone,
  Map,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Upload Images",
    icon: Upload,
    path: "/upload",
  },
  {
    title: "3D Viewer",
    icon: Box,
    path: "/viewer",
  },
  {
    title: "Flight Path",
    icon: Map,
    path: "/flight",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <Drone className="text-cyan-400" size={34} />

        <div>
          <h1 className="font-bold text-xl">DroneVision</h1>

          <p className="text-xs text-slate-400">
            3D Mapping Platform
          </p>
        </div>
      </div>

      <div className="flex-1 p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-xl mb-2 transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "hover:bg-slate-800 text-slate-300"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="border-t border-slate-800 p-5">
        <div className="rounded-xl bg-slate-900 p-4">
          <h3 className="font-semibold">
            Demo Version
          </h3>

          <p className="text-sm text-slate-400 mt-2">
            AI Drone Reconstruction
          </p>
        </div>
      </div>
    </aside>
  );
}