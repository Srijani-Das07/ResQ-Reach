import React, { useEffect, useState } from "react";
import L from "leaflet";

// Shelter data
const shelterData = [
  { name: "Velachery (Chennai)", lat: 12.9758, lon: 80.2205 },
  { name: "Adyar", lat: 13.003387, lon: 80.255043 },
  { name: "Neelankarai", lat: 12.949282, lon: 80.255013 },
  { name: "Valmiki Nagar, Adyar", lat: 12.977408, lon: 80.266808 },
  { name: "Koyambedu", lat: 13.07279, lon: 80.176163 },
  { name: "Kosapur Chettimedu Relief Camp (Manali)", lat: 13.1435, lon: 80.3140 },
  { name: "Thiru-Vi-Ka Nagar Relief Centre", lat: 13.1000, lon: 80.2750 },
  { name: "Mathur Relief Shelter (Manali Region)", lat: 13.1500, lon: 80.2800 },
  { name: "Adyar Relief Centre", lat: 13.0023, lon: 80.2530 },
  { name: "East Tambaram / Madambakkam Relief Shelter", lat: 12.9145, lon: 80.0500 },
  { name: "Kovilambakkam Relief Camp", lat: 12.9640, lon: 80.1680 },
  { name: "Madipakkam Relief Camp", lat: 12.9390, lon: 80.1870 },
  { name: "Tambaram Relief Camp", lat: 12.9330, lon: 80.1300 },
  { name: "Perungalathur Relief Camp", lat: 12.9070, lon: 80.1250 },
  { name: "Saidapet Relief Camp", lat: 13.0040, lon: 80.2220 }
];

// Haversine distance
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bearing + compass
function bearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x =
    Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function compassDir(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

const ShelterMap = () => {
  const [user, setUser] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [shelters, setShelters] = useState(shelterData);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const u = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUser(u);
          localStorage.setItem("lastLocation", JSON.stringify(u));
        },
        (err) => {
          console.warn("Location error:", err);
          const saved = localStorage.getItem("lastLocation");
          if (saved) setUser(JSON.parse(saved));
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Compute nearest
    let minDist = Infinity;
    let nearestShelter = null;
    const updatedShelters = shelters.map((s) => {
      const dist = haversine(user.lat, user.lon, s.lat, s.lon);
      if (dist < minDist) {
        minDist = dist;
        nearestShelter = { ...s, distance: dist };
      }
      return { ...s, distance: dist };
    });

    setShelters(updatedShelters);
    setNearest(nearestShelter);

    // Leaflet map
    const map = L.map("map").setView([user.lat, user.lon], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);

    const redIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([user.lat, user.lon], { icon: redIcon })
      .addTo(map)
      .bindPopup("📍 You are here");

    const greenIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if (nearestShelter) {
      L.marker([nearestShelter.lat, nearestShelter.lon], { icon: greenIcon })
        .addTo(map)
        .bindPopup(
          `Nearest Shelter: ${nearestShelter.name}<br>${nearestShelter.distance.toFixed(
            2
          )} km away`
        );
    }

    updatedShelters.forEach((s) => {
      if (!nearestShelter || s.name !== nearestShelter.name) {
        L.marker([s.lat, s.lon])
          .addTo(map)
          .bindPopup(`${s.name}<br>${s.distance.toFixed(2)} km away`);
      }
    });

    return () => {
      map.remove(); // cleanup
    };
  }, [user]);

  if (!user) return <p>Loading location...</p>;

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Left: Map + Guide Me */}
      <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div id="map" style={{ width: "100%", height: "500px" }}></div>
        {nearest && (
          <button
            style={{ marginTop: "15px", padding: "10px 20px", fontSize: "16px" }}
            onClick={() => {
              const origin = `${user.lat},${user.lon}`;
              const destination = `${nearest.lat},${nearest.lon}`;
              const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
              window.open(url, "_blank");
            }}
          >
            🚗 Guide Me to Nearest Shelter
          </button>
        )}
      </div>

      {/* Right: Table */}
      <div style={{ flex: 1 }}>
        <h3>Relief Shelters</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Name
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Distance
              </th>
            </tr>
          </thead>
          <tbody>
            {shelters.map((s) => (
              <tr
                key={s.name}
                style={{
                  background: nearest && s.name === nearest.name ? "#d4edda" : "transparent"
                }}
              >
                <td style={{ padding: "8px" }}>{s.name}</td>
                <td style={{ padding: "8px" }}>
                  {s.distance ? `${s.distance.toFixed(2)} km` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShelterMap;