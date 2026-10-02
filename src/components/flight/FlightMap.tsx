import "./FlightMap.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { FlightImageInfo } from "./FlightSidebar";
import type { SurveyBoundaryPoint } from "../../services/droneSurveyService";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  images: FlightImageInfo[];
  selectedImage: FlightImageInfo | null;
  boundary?: SurveyBoundaryPoint[];
  onMarkerClick: (image: FlightImageInfo) => void;
}

function FitBounds({
  images,
  boundary,
}: {
  images: FlightImageInfo[];
  boundary?: SurveyBoundaryPoint[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngTuple[] = [];

    images.forEach((img) => {
      if (img.latitude && img.longitude) {
        points.push([img.latitude, img.longitude]);
      }
    });

    if (boundary && boundary.length > 0) {
      boundary.forEach((pt) => {
        points.push([pt.lat, pt.lng]);
      });
    }

    if (points.length === 0) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 19,
    });
  }, [images, boundary, map]);

  return null;
}

const FlightMap = ({
  images,
  selectedImage: _selectedImage,
  boundary,
  onMarkerClick,
}: Props) => {
  if (!images.length) {
    return (
      <div className="flight-map flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-center p-6 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">No Geotagged Flight Data Available</p>
          <p className="text-xs text-slate-400 mt-1">Upload drone survey imagery containing EXIF GPS coordinates to plot the trajectory.</p>
        </div>
      </div>
    );
  }

  const validImages = images.filter(
    (img) =>
      typeof img.latitude === "number" &&
      typeof img.longitude === "number" &&
      !isNaN(img.latitude) &&
      !isNaN(img.longitude)
  );

  if (validImages.length === 0) {
    return (
      <div className="flight-map flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-center p-6 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">GPS Coordinates Unavailable</p>
          <p className="text-xs text-slate-400 mt-1">Images were ingested without valid GNSS telemetry.</p>
        </div>
      </div>
    );
  }

  const center: L.LatLngTuple = [
    validImages[0].latitude,
    validImages[0].longitude,
  ];

  return (
    <div className="flight-map relative h-full w-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={17}
        className="leaflet-map h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Survey Boundary (Footprint) */}
        {boundary && boundary.length >= 3 && (
          <Polygon
            positions={boundary.map((b) => [b.lat, b.lng] as L.LatLngTuple)}
            pathOptions={{
              color: "#059669",
              weight: 2,
              fillColor: "#10b981",
              fillOpacity: 0.15,
              dashArray: "4 4",
            }}
          />
        )}

        {/* Flight Trajectory Polyline */}
        <Polyline
          positions={validImages.map(
            (img) => [img.latitude, img.longitude] as L.LatLngTuple
          )}
          pathOptions={{
            color: "#0284c7",
            weight: 3.5,
            opacity: 0.85,
          }}
        />

        {/* Individual Photo Markers */}
        {validImages.map((img, idx) => {
          return (
            <Marker
              key={img.image || idx}
              position={[img.latitude, img.longitude]}
              eventHandlers={{
                click: () => onMarkerClick(img),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-900">
                    <span>Photo #{idx + 1}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 font-mono">
                      {img.image}
                    </span>
                  </div>

                  <div className="space-y-1 mt-2 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lat:</span>
                      <span className="font-mono font-medium">{img.latitude.toFixed(6)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lng:</span>
                      <span className="font-mono font-medium">{img.longitude.toFixed(6)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Altitude:</span>
                      <span className="font-mono font-medium">
                        {img.altitude !== undefined ? `${img.altitude.toFixed(1)} m` : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Camera:</span>
                      <span className="truncate max-w-[120px]">{img.camera || "Unavailable"}</span>
                    </div>
                    {img.timestamp && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Captured:</span>
                        <span className="text-[10px] text-slate-700">
                          {new Date(img.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FitBounds images={validImages} boundary={boundary} />
      </MapContainer>
    </div>
  );
};

export default FlightMap;