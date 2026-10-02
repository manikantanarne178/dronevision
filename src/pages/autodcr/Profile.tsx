import React, { useState } from "react";
import { User, Mail, Shield, Building2, Lock, Save } from "lucide-react";
import Button from "../../components/common/Button";
import "./Profile.css";

export default function Profile() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Senior Municipal Officer"
  );
  const [email, setEmail] = useState("officer@municipal.gov.in");
  const [department, setDepartment] = useState(
    "Development Control & Building Approval"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("username", username);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="autodcr-profile-container space-y-6">
      {/* Title */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Municipal Officer Profile
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Manage your AutoDCR portal credentials and authority parameters.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
          Profile updated successfully!
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{username}</h2>
            <p className="text-xs text-cyan-700 font-semibold mt-0.5">
              Authorized Scrutiny Officer | Municipal Corporation
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 pr-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 pr-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Authority
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 pr-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={16} />
              <span className="text-slate-700 font-semibold">
                Security Role: Admin Scrutinizer
              </span>
            </div>
            <button
              type="button"
              className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Lock size={12} /> Change Password
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Save size={16} />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
