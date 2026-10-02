import { useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  User,
  Menu,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const username = localStorage.getItem("username") || "Municipal Officer";
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  // Determine current context badge
  const isAutoDCR = location.pathname.includes("autodcr") || location.pathname === "/";

  return (
    <header className="h-16 sm:h-[68px] bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex justify-between items-center shrink-0 z-30 sticky top-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      {/* Left section: Hamburger button + Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 lg:hidden transition-all cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Building2 size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                {isAutoDCR ? "AutoDCR Portal" : "DroneVision 3D"}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/80 shrink-0">
                <ShieldCheck size={12} /> Enterprise Scrutiny
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block truncate">
              {isAutoDCR
                ? "Automated Development Control Regulations Scrutiny Engine"
                : "AI Aerial Photogrammetry & Spatial Mapping Platform"}
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            placeholder="Search rules, projects..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-1.5 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-600" />
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <UserCircle size={22} className="text-cyan-700 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
              {username}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-1.5 space-y-0.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-semibold text-xs text-slate-900 truncate">{username}</p>
                <p className="text-[11px] text-cyan-700 font-medium">Municipal Admin</p>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <User size={15} className="text-slate-400" />
                Officer Profile
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}