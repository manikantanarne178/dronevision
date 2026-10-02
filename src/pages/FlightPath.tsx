import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import "./FlightPath.css";

import FlightMap from "../components/flight/FlightMap";
import FlightSidebar from "../components/flight/FlightSidebar";
import FlightStats from "../components/flight/FlightStats";
import { useDroneSurvey } from "../context/DroneSurveyContext";
import type { FlightImageInfo } from "../components/flight/FlightSidebar";
import {
  Navigation,
  MapPin,
  ArrowRight,
  Upload,
} from "lucide-react";

const FlightPath = () => {
  const { projectId } = useParams();
  const { surveys, activeSurvey, setActiveSurveyId } = useDroneSurvey();
  const [flightImages, setFlightImages] = useState<FlightImageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<FlightImageInfo | null>(
    null
  );

  // Sync selected project ID from URL if present
  useEffect(() => {
    if (projectId) {
      const match = surveys.find(
        (s) => s.id === projectId || s.backendProjectId === projectId
      );
      if (match) {
        setActiveSurveyId(match.id);
      }
    }
  }, [projectId, surveys, setActiveSurveyId]);

  // Load flight images from active survey or backend `/gps/`
  useEffect(() => {
    if (activeSurvey && activeSurvey.images.length > 0) {
      const mapped: FlightImageInfo[] = activeSurvey.images
        .filter((img) => img.hasGPS && img.latitude !== undefined && img.longitude !== undefined)
        .map((img) => ({
          image: img.filename,
          latitude: img.latitude!,
          longitude: img.longitude!,
          altitude: img.altitude,
          timestamp: img.timestamp,
          camera: img.cameraModel || img.cameraMake || "Aerial Sensor",
          yaw: img.heading,
          pitch: img.pitch,
          roll: img.roll,
          imageUrl: img.previewUrl,
        }));

      setFlightImages(mapped);
      if (mapped.length > 0) {
        setSelectedImage(mapped[0]);
      }
    } else {
      // Fallback: try fetching from live backend GPS endpoint
      const fetchLiveGPS = async () => {
        try {
          const res = await API.get("/gps/");
          const locations: FlightImageInfo[] = res.data?.locations || [];
          setFlightImages(locations);
          if (locations.length > 0) {
            setSelectedImage(locations[0]);
          }
        } catch (err) {
          console.warn("Backend GPS endpoint notice:", err);
        }
      };
      fetchLiveGPS();
    }
  }, [activeSurvey]);

  return (
    <div className="flight-page space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Navigation className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              UAV Telemetry & Spatial Waypoints
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Flight Path & Geotag Mapping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeSurvey
              ? `Active Mission: ${activeSurvey.name} (${activeSurvey.geotaggedImageCount} geotagged / ${activeSurvey.imageCount} total images)`
              : "Reconstructed aerial flight trajectory with synchronized GNSS/IMU sensor locations."}
          </p>
        </div>

        {/* Survey Switcher / Selector */}
        <div className="flex items-center gap-2">
          {surveys.length > 1 && (
            <select
              value={activeSurvey?.id || ""}
              onChange={(e) => setActiveSurveyId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.imageCount} imgs)
                </option>
              ))}
            </select>
          )}

          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-all shadow-xs shrink-0"
          >
            <Upload size={14} />
            New Survey
          </Link>
        </div>
      </div>

      {/* Geodesic Spatial Footprint Banner if available */}
      {activeSurvey && activeSurvey.geotaggedImageCount >= 3 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-2xl text-white shadow-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
              GPS Survey Footprint
            </span>
            <span className="text-lg font-bold font-mono text-cyan-300">
              {activeSurvey.areaSqm.toLocaleString()} m²
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ({activeSurvey.areaAcres} acres / {activeSurvey.areaHectares} ha)
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
              Perimeter Length
            </span>
            <span className="text-lg font-bold font-mono text-emerald-300">
              {activeSurvey.perimeterM.toLocaleString()} m
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              WGS84 Closed Boundary
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
              Coordinate Reference
            </span>
            <span className="text-sm font-bold font-mono text-amber-300 truncate block">
              {activeSurvey.utmZone || "WGS84 (EPSG:4326)"}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Global Geodetic Datum
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
              Elevation Delta (ΔZ)
            </span>
            <span className="text-lg font-bold font-mono text-indigo-300">
              {activeSurvey.elevation
                ? `${activeSurvey.elevation.deltaElevation.toFixed(1)} m`
                : "Unavailable"}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Terrain Relief Range
            </span>
          </div>
        </div>
      )}

      {/* Flight Stats */}
      <FlightStats images={flightImages} />

      {/* Map & Sidebar Viewport */}
      {flightImages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[560px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-2">
            <FlightMap
              images={flightImages}
              selectedImage={selectedImage}
              boundary={activeSurvey?.surveyBoundary}
              onMarkerClick={setSelectedImage}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 overflow-y-auto max-h-[560px]">
            <FlightSidebar
              images={flightImages}
              selectedImage={selectedImage}
            />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Active Flight Trajectory Data
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Upload aerial drone photographs with EXIF GPS tags to generate an interactive flight path, camera markers, and survey footprint.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Upload Drone Survey <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default FlightPath;