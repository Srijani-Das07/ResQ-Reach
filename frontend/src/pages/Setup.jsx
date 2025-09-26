import React, { useState } from "react";

function Setup() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = () => {
    if (!lat || !lon) {
      setMessage("⚠️ Please enter both latitude and longitude.");
      return;
    }
    const user = { lat: parseFloat(lat), lon: parseFloat(lon) };
    localStorage.setItem("lastLocation", JSON.stringify(user));
    setMessage(`✅ Location saved: ${lat}, ${lon}`);
  };

  const handleUseGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          localStorage.setItem("lastLocation", JSON.stringify(user));
          setMessage(
            `✅ Location saved using GPS: ${user.lat.toFixed(
              4
            )}, ${user.lon.toFixed(4)}`
          );
        },
        (err) => {
          console.warn("Location error:", err);
          setMessage("❌ Could not fetch location. Please enter manually.");
        }
      );
    } else {
      setMessage("❌ Geolocation not supported in this browser.");
    }
  };

  return (
    <div>
      <h1>Setup Page</h1>
      <p>Save your location so the dashboard can guide you to the nearest shelter.</p>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Latitude:{" "}
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Longitude:{" "}
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleSave}>Save Location</button>
      <button onClick={handleUseGeolocation} style={{ marginLeft: "10px" }}>
        Use My GPS Location
      </button>

      {message && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}

export default Setup;