import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User as UserIcon, Building2, AlertCircle } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const register = async () => {
    setErrorMessage(null);
    try {
      setLoading(true);

      await axios.post(`${API}/api/auth/register`, {
        username,
        email,
        password,
      });

      alert("Registration Successful. Please Login with your credentials.");
      setIsLogin(true);
      setPassword("");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || "Registration failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setErrorMessage(null);
    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (!res.data.access_token) {
        setErrorMessage("No access_token returned from authentication server");
        return;
      }

      localStorage.setItem("token", res.data.access_token);

      const me = await axios.get(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${res.data.access_token}`,
        },
      });

      if (me.data.username) {
        localStorage.setItem("username", me.data.username);
      }

      window.location.href = "/";
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setErrorMessage(
        err.response?.data?.detail || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 mb-3 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            DroneVision / AutoDCR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Aerial Photogrammetry & Municipal Bylaw Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              isLogin
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Account Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              !isLogin
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            New Officer Register
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLogin) login();
            else register();
          }}
          className="space-y-4"
        >
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name / Department
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Planning Officer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs rounded-lg bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Government / Official Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@municipal.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-lg bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Security Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs rounded-lg bg-white border border-slate-200 pl-9 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>{isLogin ? "Sign In to Portal" : "Complete Registration"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit SSL Encrypted Municipal Gateway</span>
        </div>
      </div>
    </div>
  );
}