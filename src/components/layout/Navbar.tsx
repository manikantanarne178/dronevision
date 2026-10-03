import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  Menu,
  ShieldCheck,
  Building2,
  Lock,
  Check,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DroneApiService, { type AppNotification } from "../../services/droneApiService";
import ChangePasswordModal from "../common/ChangePasswordModal";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const username = localStorage.getItem("username") || "Municipal Officer";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications on mount and periodically
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingNotifs(true);
      const res = await DroneApiService.listNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch (err) {
      console.warn("Notifications fetch notice:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleMarkRead = async (id: number) => {
    try {
      await DroneApiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await DroneApiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUserMenuOpen(false);
    navigate("/login");
  };

  // Determine current context badge
  const isAutoDCR = location.pathname.includes("autodcr") || location.pathname === "/";

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />;
      case "error":
        return <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />;
      case "info":
      default:
        return <Info size={16} className="text-cyan-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <>
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

          {/* Notifications Bell & Popover */}
          <div ref={notifMenuRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (!notifOpen) fetchNotifications();
              }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Popover Header */}
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-cyan-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {loadingNotifs && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
                      <Loader2 size={16} className="animate-spin text-cyan-600" />
                      <span>Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <Bell size={24} className="mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-semibold text-slate-600">No notifications yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Survey processing and account events will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                          n.read ? "bg-white hover:bg-slate-50/70" : "bg-cyan-50/40 hover:bg-cyan-50/70"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {getNotifIcon(n.type)}
                          <div className="min-w-0">
                            <p className={`text-xs ${n.read ? "font-medium text-slate-800" : "font-bold text-slate-950"}`}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            {n.created_at && (
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} • {new Date(n.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1 text-slate-400 hover:text-cyan-700 hover:bg-cyan-100/50 rounded-lg shrink-0 transition-colors cursor-pointer"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
            >
              <UserCircle size={22} className="text-cyan-700 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                {username}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-1.5 space-y-0.5">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-semibold text-xs text-slate-900 truncate">{username}</p>
                  <p className="text-[11px] text-cyan-700 font-medium">Authenticated Account</p>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  <Lock size={15} className="text-slate-400" />
                  Change Password
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}