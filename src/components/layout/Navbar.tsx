import { useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  User,
  Menu,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const username = localStorage.getItem("username") || "Municipal Officer";
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex justify-between items-center shrink-0 z-30 sticky top-0">
      {/* Left section: Hamburger button + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 lg:hidden transition-all"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AutoDCR Portal
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck size={12} /> Live Scrutiny
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Automatic Development Control Regulations Scrutiny Engine
          </p>
        </div>
      </div>

      {/* Right section: Search, Theme, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Search */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            placeholder="Search rules, projects, files..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 py-2 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all relative"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <UserCircle size={28} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white hidden sm:inline max-w-[120px] truncate">
              {username}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl z-50 p-2 space-y-1">
              <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                <p className="font-semibold text-sm text-white">{username}</p>
                <p className="text-xs text-cyan-400 font-medium">Municipal Admin</p>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
              >
                <User size={16} className="text-slate-400" />
                Profile
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}