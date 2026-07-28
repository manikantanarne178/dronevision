import "./Settings.css";
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Save,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="settings-page">

      <h1>Settings</h1>
      <p className="subtitle">
        Configure your DroneVision application
      </p>

      <div className="settings-grid">

        <div className="setting-card">
          <div className="setting-title">
            <User size={22} />
            Profile
          </div>

          <label>Name</label>
          <input type="text" placeholder="John Doe" />

          <label>Email</label>
          <input type="email" placeholder="john@email.com" />
        </div>

        <div className="setting-card">
          <div className="setting-title">
            <Bell size={22} />
            Notifications
          </div>

          <div className="switch-row">
            <span>Email Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="switch-row">
            <span>Push Notifications</span>
            <input type="checkbox" />
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-title">
            <Shield size={22} />
            Security
          </div>

          <button className="outline-btn">
            Change Password
          </button>

          <button className="outline-btn">
            Enable 2FA
          </button>
        </div>

        <div className="setting-card">
          <div className="setting-title">
            <Globe size={22} />
            Preferences
          </div>

          <label>Language</label>

          <select>
            <option>English</option>
            <option>Telugu</option>
          </select>

          <div className="switch-row">
            <span>Dark Mode</span>
            <Moon size={20} />
          </div>
        </div>

      </div>

      <button className="save-btn">
        <Save size={18} />
        Save Changes
      </button>

    </div>
  );
}