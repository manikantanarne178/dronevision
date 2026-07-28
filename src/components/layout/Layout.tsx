import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-white">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Navbar />

        <main className="flex-1 overflow-auto p-6 bg-slate-900">

          <Outlet />

        </main>

      </div>

    </div>
  );
};

export default Layout;