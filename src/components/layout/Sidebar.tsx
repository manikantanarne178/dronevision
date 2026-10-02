import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileCheck2,
  ScanSearch,
  Calculator,
  ShieldCheck,
  Leaf,
  Accessibility,
  FileText,
  BookOpen,
  BarChart3,
  FolderGit2,
  History,
  User,
  Settings,
  X,
  Building2,
  Box,
  Map,
  Route,
  FileBarChart,
  Layers,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const autodcrMenu = [
  { title: "Scrutiny Overview", icon: LayoutDashboard, path: "/autodcr-dashboard" },
  { title: "Upload Drawing", icon: Upload, path: "/autodcr/upload" },
  { title: "Parsing Progress", icon: FileCheck2, path: "/autodcr/parse" },
  { title: "Feature Detection", icon: ScanSearch, path: "/autodcr/detect" },
  { title: "Area & FSI Calculation", icon: Calculator, path: "/autodcr/calculate" },
  { title: "Rule Validation", icon: ShieldCheck, path: "/autodcr/validate" },
  { title: "Green Building", icon: Leaf, path: "/autodcr/green-building" },
  { title: "Accessibility (NBC)", icon: Accessibility, path: "/autodcr/accessibility" },
  { title: "Scrutiny Report", icon: FileText, path: "/autodcr/report" },
  { title: "Municipal Bye-laws", icon: BookOpen, path: "/autodcr/rules" },
  { title: "System Metrics", icon: BarChart3, path: "/autodcr/metrics" },
  { title: "Project Archive", icon: FolderGit2, path: "/autodcr/projects" },
  { title: "Audit Trail", icon: History, path: "/autodcr/history" },
];

const droneVisionMenu = [
  { title: "Drone Dashboard", icon: LayoutDashboard, path: "/drone-dashboard" },
  { title: "Upload Images", icon: Upload, path: "/upload" },
  { title: "3D Mesh Viewer", icon: Box, path: "/viewer" },
  { title: "Flight Path & GPS", icon: Route, path: "/flight-path" },
  { title: "CAD Drawing DXF", icon: Layers, path: "/drawing" },
  { title: "Road & Frontage", icon: Map, path: "/road-detection" },
  { title: "Spatial Analysis", icon: Calculator, path: "/analysis" },
  { title: "Mapping Reports", icon: FileBarChart, path: "/reports" },
];

const accountMenu = [
  { title: "Officer Profile", icon: User, path: "/profile" },
  { title: "System Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-[1px_0_3px_0_rgba(0,0,0,0.02)] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 sm:h-[68px] flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight truncate">
                DroneVision
              </h1>
              <p className="text-[11px] font-semibold text-cyan-700 tracking-wide truncate">
                AutoDCR Scrutiny Suite
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {/* Main AutoDCR Engine Menu */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              AutoDCR Municipal Suite
            </p>
            <div className="space-y-0.5">
              {autodcrMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-800 font-semibold border-l-3 border-cyan-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* DroneVision 3D Photogrammetry Menu */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Drone Aerial Imaging
            </p>
            <div className="space-y-0.5">
              {droneVisionMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-800 font-semibold border-l-3 border-cyan-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* User & Settings */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Settings & Authority
            </p>
            <div className="space-y-0.5">
              {accountMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-800 font-semibold border-l-3 border-cyan-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <div className="rounded-xl bg-white border border-slate-200 p-2.5 flex items-center gap-2.5 shadow-2xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                AutoDCR Engine 2.0
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Municipal API Connected
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}