import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Viewer from "../pages/Viewer";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import FlightPath from "../pages/FlightPath";

/* ---------- AutoDCR Pages ---------- */
import Drawing from "../pages/Drawing";
import RoadDetection from "../pages/RoadDetection";
import AreaAnalysis from "../pages/AreaAnalysis";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main Layout */}
        <Route element={<Layout />}>

          {/* ============================= */}
          {/* DroneVision */}
          {/* ============================= */}

          <Route path="/" element={<Dashboard />} />

          <Route path="/upload" element={<Upload />} />

          <Route path="/viewer" element={<Viewer />} />
          <Route path="/viewer/:projectId" element={<Viewer />} />

          <Route path="/flight" element={<FlightPath />} />
          <Route path="/flight-path" element={<FlightPath />} />
          <Route
            path="/flight-path/:projectId"
            element={<FlightPath />}
          />

          {/* ============================= */}
          {/* AutoDCR */}
          {/* ============================= */}

          <Route
            path="/drawing"
            element={<Drawing />}
          />

          <Route
            path="/road-detection"
            element={<RoadDetection />}
          />

          <Route
            path="/analysis"
            element={<AreaAnalysis />}
          />

          {/* Shared */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;