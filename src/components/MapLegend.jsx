import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const MapLegend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <div style="
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
          font-size: 14px;
          display: flex;
          gap: 16px;
          align-items: center;
        ">
          <div style="display: flex; align-items: center;">
            <span style="background:#15803d;width:14px;height:14px;display:inline-block;margin-right:6px;border-radius:2px;"></span>Available
          </div>
          <div style="display: flex; align-items: center;">
            <span style="background:orange;width:14px;height:14px;display:inline-block;margin-right:6px;border-radius:2px;"></span>Reserved
          </div>
          <div style="display: flex; align-items: center;">
            <span style="background:red;width:14px;height:14px;display:inline-block;margin-right:6px;border-radius:2px;"></span>Sold
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

export default MapLegend;
