const socket = io(); // Connect to Socket.io server

// Initialize Leaflet map and set the initial view
const map = L.map("map").setView([0, 0], 2);

// Add tile layer from OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

// Check if geolocation is supported
if (navigator.geolocation) {
  // Watch for changes in geolocation
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Emit location data to the server via Socket.io
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Error getting geolocation:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
} else {
  console.error("Geolocation is not supported by this browser");
}

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});