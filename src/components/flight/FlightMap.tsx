import "./FlightMap.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";
import type { FlightImageInfo } from "./FlightSidebar";
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
  onMarkerClick: (image: FlightImageInfo) => void;
}

function FitBounds({
  images,
}: {
  images: FlightImageInfo[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!images.length) return;

    const bounds = L.latLngBounds(
      images.map((img) => [img.latitude, img.longitude] as L.LatLngTuple)
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
    });
  }, [images, map]);

  return null;
}

const FlightMap = ({
  images,
  selectedImage: _selectedImage,
  onMarkerClick,
}: Props) => {
  if (!images.length) {
    return (
      <div className="flight-map">
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            color: "#666",
          }}
        >
          No GPS data available
        </div>
      </div>
    );
  }

  return (
    <div className="flight-map">
      <MapContainer
        center={[images[0].latitude, images[0].longitude]}
        zoom={18}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={images.map(
            (img) => [img.latitude, img.longitude] as L.LatLngTuple
          )}
          pathOptions={{
            color: "#06b6d4",
            weight: 4,
          }}
        />

        {images.map((img) => (
          <Marker
            key={img.image}
            position={[img.latitude, img.longitude]}
            eventHandlers={{
              click: () => onMarkerClick(img),
            }}
          >
            <Popup>
              <div className="popup">
                <strong>{img.image}</strong>

                <hr />

                <p>
                  <strong>Latitude:</strong>{" "}
                  {img.latitude.toFixed(6)}
                </p>

                <p>
                  <strong>Longitude:</strong>{" "}
                  {img.longitude.toFixed(6)}
                </p>

                <p>
                  <strong>Altitude:</strong>{" "}
                  {img.altitude ?? "--"} m
                </p>

                <p>
                  <strong>Captured:</strong>{" "}
                  {img.timestamp ?? "--"}
                </p>

                <p>
                  <strong>Camera:</strong>{" "}
                  {img.camera ?? "Unknown"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds images={images} />
      </MapContainer>
    </div>
  );
};

export default FlightMap;