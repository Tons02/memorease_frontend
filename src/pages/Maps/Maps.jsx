import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const center = [14.288794, 120.970325];

const DrawingTool = ({ onAddLot, isDrawing, setIsDrawing }) => {
  const [drawingCoords, setDrawingCoords] = useState([]);

  // Handle map clicks only if in drawing mode
  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      setDrawingCoords((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  // Listen for Enter key to finish drawing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && drawingCoords.length >= 3 && isDrawing) {
        onAddLot(drawingCoords);
        setDrawingCoords([]);
        setIsDrawing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawingCoords, isDrawing]);

  return drawingCoords.length > 0 ? (
    <Polygon
      positions={drawingCoords}
      pathOptions={{ color: "purple", dashArray: "4", fillOpacity: 0.2 }}
    />
  ) : null;
};

const Maps = () => {
  const [lots, setLots] = useState([
    {
      id: 1,
      name: "Lot A",
      coordinates: [
        [14.2871, 120.971],
        [14.2872, 120.9711],
        [14.287, 120.9712],
      ],
    },
  ]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleAddLot = (coords) => {
    const newLot = {
      id: lots.length + 1,
      name: `Lot ${String.fromCharCode(65 + lots.length)}`,
      coordinates: coords,
    };
    setLots((prev) => [...prev, newLot]);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={18}
        scrollWheelZoom
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DrawingTool
          onAddLot={handleAddLot}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
        />

        {lots.map((lot) => (
          <Polygon
            key={lot.id}
            positions={lot.coordinates}
            pathOptions={{ color: "green", fillOpacity: 0.5 }}
          >
            <Popup>
              <strong>{lot.name}</strong>
              <br />
              Points: {lot.coordinates.length}
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          background: "#fff",
          padding: "10px 15px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p>
          🎯 <b>{isDrawing ? "Drawing..." : "Not Drawing"}</b>
          <br />
          🖱 Click to add points
          <br />⏎ Press <strong>Enter</strong> to finish
        </p>
        <button
          onClick={() => setIsDrawing((prev) => !prev)}
          style={{
            marginTop: "8px",
            padding: "6px 10px",
            background: isDrawing ? "#dc2626" : "#15803d",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isDrawing ? "Cancel Drawing" : "Start Drawing"}
        </button>
      </div>
    </div>
  );
};

export default Maps;
