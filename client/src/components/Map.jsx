import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const Map = ({ onLocationSelect, route, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      console.log("Initializing map...");
      console.log("Map container:", mapRef.current);
      console.log("Leaflet available:", typeof L);

      try {
        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
          center: [40.7128, -74.006], // New York City
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        console.log("Map instance created:", mapInstance.current);
      } catch (error) {
        console.error("Error creating map:", error);
        return;
      }

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Add click handler for location selection
      if (onLocationSelect) {
        mapInstance.current.on("click", (e) => {
          const { lat, lng } = e.latlng;
          console.log("Map clicked:", lat, lng);

          // Use Nominatim for reverse geocoding
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
            .then((response) => response.json())
            .then((data) => {
              const address =
                data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              console.log("Address found:", address);
              onLocationSelect(lng, lat, address);
            })
            .catch((error) => {
              console.error("Geocoding error:", error);
              onLocationSelect(
                lng,
                lat,
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              );
            });
        });
      }

      setMapLoaded(true);
      console.log("Map initialized successfully");
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onLocationSelect]);

  // Draw route when route prop changes
  useEffect(() => {
    if (mapInstance.current && mapLoaded && route) {
      console.log("Drawing route:", route);

      // Remove existing route layers
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Polyline && layer.options.color === "#3b82f6") {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Add new route
      if (route.features && route.features.length > 0) {
        const coordinates = route.features[0].geometry.coordinates;
        const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

        const routeLine = L.polyline(latLngs, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapInstance.current);

        // Fit map to route bounds
        mapInstance.current.fitBounds(routeLine.getBounds(), {
          padding: [20, 20],
        });
      }
    }
  }, [route, mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            <p className="mt-1 text-xs text-gray-500">
              If the map doesn't load, check the browser console
            </p>
          </div>
        </div>
      )}
      {mapLoaded && !mapInstance.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100">
          <div className="text-center">
            <div className="text-red-600 text-lg">⚠️</div>
            <p className="mt-2 text-sm text-red-700">Map failed to load</p>
            <p className="mt-1 text-xs text-red-600">
              Check browser console for errors
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
