import "./FlightSidebar.css";

export interface FlightImageInfo {
  image: string;
  latitude: number;
  longitude: number;

  altitude?: number;
  timestamp?: string;
  camera?: string;

  yaw?: number;
  pitch?: number;
  roll?: number;

  imageUrl?: string;
}

interface FlightSidebarProps {
  images?: FlightImageInfo[];
  selectedImage?: FlightImageInfo | null;
}

const FlightSidebar = ({ selectedImage }: FlightSidebarProps) => {
  if (!selectedImage) {
    return (
      <div className="flight-sidebar">
        <div className="sidebar-header">
          <h2>Mission Details</h2>
          <p>Select a marker</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-sidebar">
      <div className="sidebar-header">
        <h2>Mission Details</h2>
        <p>Captured Image Information</p>
      </div>

      <div className="preview-card">
        {selectedImage.imageUrl ? (
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.image}
            className="preview-image"
          />
        ) : (
          <div className="preview-placeholder">
            📷
            <span>Image Preview</span>
          </div>
        )}
      </div>

      <div className="details-section">

        <div className="detail-row">
          <span>Filename</span>
          <strong>{selectedImage.image}</strong>
        </div>

        <div className="detail-row">
          <span>Latitude</span>
          <strong>{selectedImage.latitude.toFixed(6)}</strong>
        </div>

        <div className="detail-row">
          <span>Longitude</span>
          <strong>{selectedImage.longitude.toFixed(6)}</strong>
        </div>

        <div className="detail-row">
          <span>Altitude</span>
          <strong>{selectedImage.altitude ?? "--"} m</strong>
        </div>

        <div className="detail-row">
          <span>Captured</span>
          <strong>{selectedImage.timestamp ?? "--"}</strong>
        </div>

        <div className="detail-row">
          <span>Camera</span>
          <strong>{selectedImage.camera ?? "Unknown"}</strong>
        </div>

      </div>

      <div className="orientation-section">

        <h3>Camera Orientation</h3>

        <div className="orientation-grid">

          <div className="orientation-card">
            <label>Yaw</label>
            <span>{selectedImage.yaw ?? "--"}°</span>
          </div>

          <div className="orientation-card">
            <label>Pitch</label>
            <span>{selectedImage.pitch ?? "--"}°</span>
          </div>

          <div className="orientation-card">
            <label>Roll</label>
            <span>{selectedImage.roll ?? "--"}°</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FlightSidebar;