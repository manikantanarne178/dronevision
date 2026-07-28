import "./FlightStats.css";
import type { FlightImageInfo } from "./FlightSidebar";

interface Props {
  images: FlightImageInfo[];
}

const FlightStats = ({ images }: Props) => {

  const totalImages = images.length;

  const totalDistance = images.reduce((sum, _, index) => {
    if (index === 0) return 0;

    const dx =
      images[index].latitude -
      images[index - 1].latitude;

    const dy =
      images[index].longitude -
      images[index - 1].longitude;

    return sum + Math.sqrt(dx * dx + dy * dy) * 111000;
  }, 0);

  const altitudeImages = images.filter(
    (img) => img.altitude !== undefined
  );

  const avgAltitude =
    altitudeImages.length > 0
      ? altitudeImages.reduce(
          (sum, img) => sum + (img.altitude ?? 0),
          0
        ) / altitudeImages.length
      : null;

  const timestamps = images
    .filter((img) => img.timestamp)
    .map((img) => new Date(img.timestamp!).getTime());

  const flightMinutes =
    timestamps.length >= 2
      ? (Math.max(...timestamps) -
          Math.min(...timestamps)) /
        60000
      : null;

  return (
    <div className="flight-stats">

      <div className="stat-card">
        <h4>Images</h4>
        <span>{totalImages}</span>
      </div>

      <div className="stat-card">
        <h4>Distance</h4>
        <span>{totalDistance.toFixed(1)} m</span>
      </div>

      <div className="stat-card">
        <h4>Avg Altitude</h4>
        <span>
          {avgAltitude !== null
            ? `${avgAltitude.toFixed(1)} m`
            : "--"}
        </span>
      </div>

      <div className="stat-card">
        <h4>Flight Time</h4>
        <span>
          {flightMinutes !== null
            ? `${flightMinutes.toFixed(1)} min`
            : "--"}
        </span>
      </div>

    </div>
  );
};

export default FlightStats;