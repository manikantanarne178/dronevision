import { useEffect, useState } from "react";
import axios from "axios";
import "./FlightPath.css";

import FlightMap from "../components/flight/FlightMap";
import FlightSidebar from "../components/flight/FlightSidebar";
import FlightStats from "../components/flight/FlightStats";
import { useParams } from "react-router-dom";
import ProjectSelector from "../components/common/ProjectSelector";
import type { FlightImageInfo } from "../components/flight/FlightSidebar";

const FlightPath = () => {
  const [flightImages, setFlightImages] = useState<FlightImageInfo[]>([]);
  const [selectedImage, setSelectedImage] =
    useState<FlightImageInfo | null>(null);
const { projectId } = useParams();

if (!projectId) {
  return (
    <ProjectSelector
      title="Flight Path"
      subtitle="Select a project to view its flight path"
      navigateTo="/flight-path"
    />
  );
}
  useEffect(() => {
const loadGPS = async () => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/gps/"
    );

    const locations = response.data.locations;

    setFlightImages(locations);

    if (locations.length > 0) {
      setSelectedImage(locations[0]);
    }
  } catch (error) {
    console.error("Failed to load GPS data:", error);
  }
};

    loadGPS();
  }, []);

  return (
    <div className="flight-page">
      <div className="flight-header">
        <div>
          <h1>Flight Path</h1>

          <p>
            Visualize drone flight trajectory and captured GPS image locations.
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