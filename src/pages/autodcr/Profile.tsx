import { useState } from "react";
import { User, Mail, Shield, Building2, Lock, Save } from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Senior Municipal Officer"
  );
  const [email, setEmail] = useState("officer@municipal.gov.in");
  const [department, setDepartment] = useState("Development Control & Building Approval");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("username", username);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="autodcr-profile-container">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Municipal Officer Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your AutoDCR portal credentials and municipal authority settings.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm font-semibold">
          Profile updated successfully!
        </div>
      )}

      {/* Main Card */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <User size={36} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{username}</h2>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">
              Authorized Scrutiny Officer | Municipal Corporation
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 py-2.5 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 py-2.5 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Department / Authority
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 py-2.5 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-400" size={18} />
              <span className="text-slate-300 font-semibold">Security Role: Admin Scrutinizer</span>
            </div>
            <button
              type="button"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Lock size={12} /> Change Password
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
