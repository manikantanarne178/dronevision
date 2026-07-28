import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Viewer from "../pages/Viewer";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import FlightPath from "../pages/FlightPath";
const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/viewer/:projectId" element={<Viewer />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/flight" element={<FlightPath />} />
          <Route path="/flight-path" element={<FlightPath />} />

<Route
  path="/flight-path/:projectId"
  element={<FlightPath />}
/>
        </Route>

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;