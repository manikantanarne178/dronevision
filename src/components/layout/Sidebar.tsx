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
  Image,
  Box,
  Map,
  Route,
  FileBarChart,
  Camera,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
const droneVisionMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/drone-dashboard",
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
    icon: Route,
    path: "/flight-path",
  },
  {
    title: "Upload Drawing",
    icon: Upload,
    path: "/drawing",
  },
  {
    title: "Road Detection",
    icon: Map,
    path: "/road-detection",
  },
  {
    title: "Reports",
    icon: FileBarChart,
    path: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];
const autodcrMenu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/autodcr-dashboard" },
  { title: "Upload Drawing", icon: Upload, path: "/autodcr/upload" },
  { title: "Parsing Progress", icon: FileCheck2, path: "/autodcr/parse" },
  { title: "Feature Detection", icon: ScanSearch, path: "/autodcr/detect" },
  { title: "Area Calculations", icon: Calculator, path: "/autodcr/calculate" },
  { title: "Validation Results", icon: ShieldCheck, path: "/autodcr/validate" },
  { title: "Green Building", icon: Leaf, path: "/autodcr/green-building" },
  { title: "Accessibility", icon: Accessibility, path: "/autodcr/accessibility" },
  { title: "Compliance Report", icon: FileText, path: "/autodcr/report" },
  { title: "Municipal Rules", icon: BookOpen, path: "/autodcr/rules" },
  { title: "Metrics Dashboard", icon: BarChart3, path: "/autodcr/metrics" },
  { title: "Project Management", icon: FolderGit2, path: "/autodcr/projects" },
  { title: "Submission History", icon: History, path: "/autodcr/history" },
];

const accountMenu = [
  { title: "Profile", icon: User, path: "/profile" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Building2 className="text-cyan-400" size={24} />
            </div>
            <div>
<h1>DroneVision</h1>
<p>AI Mapping & Municipal Portal</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          <div>
  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
    DroneVision
  </p>

  <div className="space-y-1">
    {droneVisionMenu.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`
          }
        >
          <Icon size={18} />
          <span>{item.title}</span>
        </NavLink>
      );
    })}
  </div>
</div>
          {/* Main AutoDCR Engine Menu */}
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              AutoDCR Engine
            </p>
            <div className="space-y-1">
              {autodcrMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* User & Settings */}
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Account & System
            </p>
            <div className="space-y-1">
              {accountMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-800/80 shrink-0">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">AutoDCR Engine 2.0</p>
              <p className="text-[11px] text-slate-400 truncate">Municipal Scrutiny API Online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}