import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";
import Login from "../pages/Login";

/* DroneVision Pages */
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Viewer from "../pages/Viewer";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import FlightPath from "../pages/FlightPath";

/* Legacy AutoDCR Pages */
import Drawing from "../pages/Drawing";
import RoadDetection from "../pages/RoadDetection";
import AreaAnalysis from "../pages/AreaAnalysis";

/* Enterprise AutoDCR Engine Pages */
import LandingPage from "../pages/autodcr/LandingPage";
import AutoDCRDashboard from "../pages/autodcr/AutoDCRDashboard";
import AutoDCRUpload from "../pages/autodcr/AutoDCRUpload";
import ParsingProgress from "../pages/autodcr/ParsingProgress";
import FeatureDetection from "../pages/autodcr/FeatureDetection";
import AreaCalculations from "../pages/autodcr/AreaCalculations";
import ValidationResults from "../pages/autodcr/ValidationResults";
import GreenBuilding from "../pages/autodcr/GreenBuilding";
import Accessibility from "../pages/autodcr/Accessibility";
import AutoDCRReport from "../pages/autodcr/AutoDCRReport";
import Rules from "../pages/autodcr/Rules";
import MetricsDashboard from "../pages/autodcr/MetricsDashboard";
import AutoDCRProjects from "../pages/autodcr/AutoDCRProjects";
import SubmissionHistory from "../pages/autodcr/SubmissionHistory";
import Profile from "../pages/autodcr/Profile";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Main Application Layout Wrapper */}
        <Route element={<Layout />}>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* ==================================================== */}
          {/* AutoDCR Scrutiny Suite */}
          {/* ==================================================== */}
          <Route path="/autodcr-dashboard" element={<AutoDCRDashboard />} />
          <Route path="/autodcr/upload" element={<AutoDCRUpload />} />
          <Route path="/autodcr/parse" element={<ParsingProgress />} />
          <Route path="/autodcr/detect" element={<FeatureDetection />} />
          <Route path="/autodcr/calculate" element={<AreaCalculations />} />
          <Route path="/autodcr/validate" element={<ValidationResults />} />
          <Route path="/autodcr/green-building" element={<GreenBuilding />} />
          <Route path="/autodcr/accessibility" element={<Accessibility />} />
          <Route path="/autodcr/report" element={<AutoDCRReport />} />
          <Route path="/autodcr/rules" element={<Rules />} />
          <Route path="/autodcr/metrics" element={<MetricsDashboard />} />
          <Route path="/autodcr/projects" element={<AutoDCRProjects />} />
          <Route path="/autodcr/history" element={<SubmissionHistory />} />
          <Route path="/profile" element={<Profile />} />

          {/* ==================================================== */}
          {/* Legacy / Shared DroneVision Routes */}
          {/* ==================================================== */}
          <Route path="/drone-dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/viewer/:projectId" element={<Viewer />} />
          <Route path="/flight" element={<FlightPath />} />
          <Route path="/flight-path" element={<FlightPath />} />
          <Route path="/flight-path/:projectId" element={<FlightPath />} />
          <Route path="/drawing" element={<Drawing />} />
          <Route path="/road-detection" element={<RoadDetection />} />
          <Route path="/analysis" element={<AreaAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;