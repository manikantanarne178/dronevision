import "./Settings.css";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Preferences</h1>
          <p className="text-sm text-slate-500">
            Configure user profiles, notification channels, security policies and regional standards.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings successfully saved
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <User size={16} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">User Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Municipal Planning Engineer"
                className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                defaultValue="y21ece178@gmail.com"
                className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Bell size={16} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Notification Alerts</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Email Ingestion Reports</span>
                <span className="text-[11px] text-slate-500">Send PDF summaries upon model completion</span>
              </div>
              <input type="checkbox" defaultChecked className="accent-cyan-600 h-4 w-4 rounded cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">AutoDCR Scrutiny Alerts</span>
                <span className="text-[11px] text-slate-500">Instant notification on non-compliant rules</span>
              </div>
              <input type="checkbox" defaultChecked className="accent-cyan-600 h-4 w-4 rounded cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Shield size={16} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Security & Credentials</h2>
          </div>

          <div className="space-y-2.5">
            <button className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/20 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center justify-between">
              <span>Change Account Password</span>
              <span className="text-[11px] text-cyan-600">Updated recently</span>
            </button>

            <button className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/20 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center justify-between">
              <span>Two-Factor Authentication (2FA)</span>
              <span className="text-[11px] text-emerald-600 font-medium">Enabled</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Globe size={16} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Localization & Bylaws</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State Municipal Jurisdiction</label>
              <select className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer">
                <option>Telangana (GHMC - Municipal Scrutiny Act)</option>
                <option>Andhra Pradesh (APCRDA / DTCP)</option>
                <option>Maharashtra (UDCPR Standards)</option>
                <option>Karnataka (BBMP Building Bylaws)</option>
                <option>National Building Code (NBC 2016)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Default Units</label>
              <select className="w-full text-xs rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer">
                <option>Metric (Meters / m² / m³)</option>
                <option>Imperial (Feet / Sq.Ft / Cu.Yards)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </div>
  );
}