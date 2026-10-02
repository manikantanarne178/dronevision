import { useEffect, useState } from "react";
import API from "../api";
import "./FlightPath.css";

import FlightMap from "../components/flight/FlightMap";
import FlightSidebar from "../components/flight/FlightSidebar";
import FlightStats from "../components/flight/FlightStats";
import { useParams } from "react-router-dom";
import ProjectSelector from "../components/common/ProjectSelector";
import type { FlightImageInfo } from "../components/flight/FlightSidebar";
import { Navigation } from "lucide-react";

const FlightPath = () => {
  const { projectId } = useParams();
  const [flightImages, setFlightImages] = useState<FlightImageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<FlightImageInfo | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadGPS = async () => {
      try {
        const response = await API.get("/gps/");
        const locations = response.data.locations || [];
        setFlightImages(locations);

        if (locations.length > 0) {
          setSelectedImage(locations[0]);
        }
      } catch (error) {
        console.error("Failed to load GPS data from live backend:", error);
      }
    };

    loadGPS();
  }, [projectId]);

  if (!projectId) {
    return (
      <ProjectSelector
        title="Drone Flight Trajectory"
        subtitle="Select an aerial photogrammetry survey to inspect mission waypoints and geotagged captures"
        navigateTo="/flight-path"
      />
    );
  }

  return (
    <div className="flight-page">
      <div className="flight-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Navigation className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              UAV Telemetry & Spatial Waypoints
            </span>
          </div>
          <h1>Flight Path & Geotag Mapping</h1>
          <p>
            Reconstructed aerial flight trajectory with synchronized GNSS/IMU sensor locations.
          </p>
        </div>
      </div>

      <FlightStats images={flightImages} />

      <div className="flight-content">
        <div className="flight-map-container">
          <FlightMap
            images={flightImages}
            selectedImage={selectedImage}
            onMarkerClick={setSelectedImage}
          />
        </div>

        <div className="flight-sidebar-container">
          <FlightSidebar
            images={flightImages}
            selectedImage={selectedImage}
          />
        </div>
      </div>
    </div>
  );
};

export default FlightPath;