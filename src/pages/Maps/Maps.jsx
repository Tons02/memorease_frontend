import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Stage, Layer, Rect, Text } from "react-konva";
import "leaflet/dist/leaflet.css";

// Konva overlay component
const KonvaOverlay = ({ lots }) => {
  const map = useMap();
  const [projectedLots, setProjectedLots] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const updateCoords = () => {
      const newLots = lots.map((lot) => {
        const [sw, ne] = lot.bounds;
        const pointSW = map.latLngToContainerPoint(sw);
        const pointNE = map.latLngToContainerPoint(ne);

        const x = pointSW.x;
        const y = pointNE.y;
        const width = pointNE.x - pointSW.x;
        const height = pointSW.y - pointNE.y;

        return {
          ...lot,
          x,
          y,
          width,
          height,
        };
      });

      setProjectedLots(newLots);
    };

    updateCoords();

    map.on("move", updateCoords);
    map.on("zoom", updateCoords);

    return () => {
      map.off("move", updateCoords);
      map.off("zoom", updateCoords);
    };
  }, [map, lots]);

  // Close modal on map click
  useEffect(() => {
    const close = () => setModal(null);
    map.on("click", close);
    return () => map.off("click", close);
  }, [map]);

  const handleRectClick = (lot) => {
    setModal({
      x: lot.x + lot.width / 2,
      y: lot.y,
      lot,
    });
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1000,
          pointerEvents: "none", // important fix
        }}
      >
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            {projectedLots.map((lot) => (
              <React.Fragment key={lot.id}>
                <Rect
                  x={lot.x}
                  y={lot.y}
                  width={lot.width}
                  height={lot.height}
                  fill={
                    lot.status === "available"
                      ? "green"
                      : lot.status === "reserved"
                      ? "orange"
                      : "red"
                  }
                  stroke="black"
                  strokeWidth={1}
                  onClick={() => handleRectClick(lot)}
                  pointerEvents="auto" // enable click inside non-interactive container
                />
                <Text
                  x={lot.x + 5}
                  y={lot.y + 5}
                  text={lot.lot_number}
                  fontSize={10}
                  fill="white"
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>

      {modal && (
        <div
          style={{
            position: "absolute",
            top: modal.y - 60,
            left: modal.x - 60,
            background: "white",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 2000,
          }}
        >
          <strong>Lot: {modal.lot.lot_number}</strong>
          <br />
          Status:{" "}
          <span
            style={{
              color:
                modal.lot.status === "available"
                  ? "green"
                  : modal.lot.status === "reserved"
                  ? "orange"
                  : "red",
            }}
          >
            {modal.lot.status}
          </span>
        </div>
      )}
    </>
  );
};

// Main map component
const Maps = () => {
  const center = [14.288794, 120.970325];

  const lots = [
    {
      id: 1,
      lot_number: "A1",
      bounds: [
        [14.287186, 120.971386], // southwest (bottom-left)
        [14.287088, 120.971516], // northeast (top-right)
      ],
      status: "available",
    },
    {
      id: 2,
      lot_number: "A2",
      bounds: [
        [14.287053, 120.971396],
        [14.286954, 120.971533],
      ],
      status: "reserved",
    },
    {
      id: 3,
      lot_number: "B2",
      bounds: [
        [14.287131, 120.970952],
        [14.287057, 120.971099],
      ],
      status: "available",
    },
    {
      id: 4,
      lot_number: "C2",
      bounds: [
        [14.287161, 120.971165],
        [14.287071, 120.971321],
      ],
      status: "available",
    },

    {
      id: 5,
      lot_number: "G2",
      bounds: [
        [14.287967, 120.969946],
        [14.287924, 120.970097],
      ],
      status: "available",
    },
  ];

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={17}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <KonvaOverlay lots={lots} />
      </MapContainer>
    </div>
  );
};

export default Maps;
