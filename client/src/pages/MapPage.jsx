import React, { useState, useCallback, useEffect } from "react";
import { Map } from "../components/Map";
import { WorkingMap } from "../components/WorkingMap";
import { SearchBar } from "../components/SearchBar";
import { RoutePanel } from "../components/RoutePanel";

export const MapPage = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transportMode, setTransportMode] = useState("driving");
  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [departureTime, setDepartureTime] = useState("now");
  const [routeOptions, setRouteOptions] = useState({
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
  });

  const calculateRoute = useCallback(async (from, to) => {
    setLoading(true);
    setError("");

    try {
      // Use OSRM (Open Source Routing Machine) for free routing
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error("Failed to calculate route");
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const routeGeometry = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: routeData.geometry,
            },
          ],
        };

        setRoute(routeGeometry);
        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration,
          summary: `${from.address} → ${to.address}`,
        });
      } else {
        throw new Error("No route found");
      }
    } catch (err) {
      setError(err.message);
      setRoute(null);
      setRouteInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse URL parameters to restore shared route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const originParam = params.get("origin");
    const originAddress = params.get("originAddress");
    const destinationParam = params.get("destination");
    const destinationAddress = params.get("destinationAddress");

    if (originParam && destinationParam && originAddress && destinationAddress) {
      try {
        const [originLat, originLng] = originParam.split(",").map(Number);
        const [destLat, destLng] = destinationParam.split(",").map(Number);

        if (!isNaN(originLat) && !isNaN(originLng) && !isNaN(destLat) && !isNaN(destLng)) {
          const restoredOrigin = {
            lat: originLat,
            lng: originLng,
            address: originAddress,
          };
          const restoredDestination = {
            lat: destLat,
            lng: destLng,
            address: destinationAddress,
          };

          setOrigin(restoredOrigin);
          setDestination(restoredDestination);
          calculateRoute(restoredOrigin, restoredDestination);
        }
      } catch (error) {
        console.error("Error parsing URL parameters:", error);
      }
    }
  }, [calculateRoute]);

  const handleOriginSelect = useCallback(
    (lng, lat, address) => {
      const newOrigin = { lng, lat, address };
      setOrigin(newOrigin);

      if (destination) {
        calculateRoute(newOrigin, destination);
      }
    },
    [destination, calculateRoute]
  );

  const handleDestinationSelect = useCallback(
    (lng, lat, address) => {
      const newDestination = { lng, lat, address };
      setDestination(newDestination);

      if (origin) {
        calculateRoute(origin, newDestination);
      }
    },
    [origin, calculateRoute]
  );

  const handleClearRoute = () => {
    setOrigin(null);
    setDestination(null);
    setRoute(null);
    setRouteInfo(null);
    setError("");
  };

  // Share handlers
  const generateShareUrl = () => {
    if (!origin || !destination) return window.location.href;
    
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      originAddress: origin.address,
      destination: `${destination.lat},${destination.lng}`,
      destinationAddress: destination.address,
    });
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleShare = async () => {
    if (!routeInfo || !origin || !destination) {
      alert("Please select a route first");
      return;
    }

    const shareUrl = generateShareUrl();
    const shareText = `Route: ${origin.address} → ${destination.address}\nDistance: ${(routeInfo.distance / 1000).toFixed(1)} km\nDuration: ${Math.round(routeInfo.duration / 60)} min\n\nView route: ${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Route",
          text: `Route from ${origin.address} to ${destination.address}`,
          url: shareUrl,
        });
        setShowShareModal(false);
        return;
      } catch (error) {
        // User cancelled or error occurred, fall through to clipboard
        if (error.name !== 'AbortError') {
          console.error("Share error:", error);
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Route copied to clipboard!");
      setShowShareModal(false);
    } catch (error) {
      console.error("Clipboard error:", error);
      alert("Failed to copy route. Please try again.");
    }
  };

  const handleSocialShare = (platform) => {
    if (!routeInfo || !origin || !destination) {
      alert("Please select a route first");
      return;
    }

    const shareUrl = generateShareUrl();
    const shareText = `Route: ${origin.address} → ${destination.address}`;
    let url = "";

    if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      setShowShareModal(false);
    }
  };

  const handleStartNavigation = () => {
    // Create a more engaging navigation demo
    const navigationDemo = document.createElement("div");
    navigationDemo.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">🧭</div>
          <h2 style="
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 12px 0;
          ">Navigation Started!</h2>
          <p style="
            color: #6b7280;
            margin: 0 0 24px 0;
            line-height: 1.5;
          ">Turn-by-turn directions are now active. Follow the route on the map.</p>
          <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
          ">
            <button onclick="this.closest('div').remove()" style="
              background: #f3f4f6;
              color: #374151;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
              Close
            </button>
            <button onclick="this.closest('div').remove()" style="
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
              Start Driving
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(navigationDemo);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Google Maps Style */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Google Maps Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div className="text-gray-700 font-medium text-lg">Maps</div>
              </div>

              {/* Search Container */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Google Maps"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directions Panel - Google Maps Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            {/* Directions Icon */}
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Directions</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}
              </span>
            </div>

            {/* Directions Inputs */}
            <div className="flex-1 flex items-center space-x-2">
              {/* Starting Point */}
              <div className="flex-1 relative">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <SearchBar
                    onLocationSelect={handleOriginSelect}
                    placeholder="Choose starting point, or click on the map"
                    className="flex-1"
                  />
                </div>
                {origin && (
                  <div className="mt-1 ml-4 text-sm text-gray-600 truncate">
                    {origin.address}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>

              {/* Destination */}
              <div className="flex-1 relative">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <SearchBar
                    onLocationSelect={handleDestinationSelect}
                    placeholder="Choose destination, or click on the map"
                    className="flex-1"
                  />
                </div>
                {destination && (
                  <div className="mt-1 ml-4 text-sm text-gray-600 truncate">
                    {destination.address}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center space-x-2">
              {/* Transport Mode Options */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTransportMode("driving")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    transportMode === "driving"
                      ? "text-blue-600 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                  Driving
                </button>
                <button
                  onClick={() => setTransportMode("walking")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    transportMode === "walking"
                      ? "text-blue-600 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Walking
                </button>
                <button
                  onClick={() => setTransportMode("transit")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    transportMode === "transit"
                      ? "text-blue-600 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Transit
                </button>
              </div>

              {/* More Options Button */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Additional Directions Options */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Departure Time */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  onClick={() => setShowDepartureModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 px-2 py-1 rounded"
                >
                  {departureTime === "now"
                    ? "Leave now"
                    : `Leave at ${departureTime}`}
                </button>
              </div>

              {/* Avoid Options */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  onClick={() => setShowOptionsModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Options
                </button>
              </div>

              {/* Add Stop */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Add stop
                </button>
              </div>
            </div>

            {/* Route Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetailsModal(true)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                Details
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50">
        {/* Map */}
        <div className="flex-1 relative">
          <WorkingMap
            onLocationSelect={handleDestinationSelect}
            route={route}
            className="h-full"
          />

          {/* Google Maps Style Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            {/* Zoom Controls */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-b border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 12H6"
                  />
                </svg>
              </button>
            </div>

            {/* Map Type Controls */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-b border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* My Location Button */}
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
              <div className="bg-white rounded-lg p-4 flex items-center space-x-3 shadow-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <div className="text-gray-700 font-medium">
                  Calculating route...
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message - Google Maps Style */}
          {!origin && !destination && (
            <div className="absolute top-4 left-4 z-10 max-w-sm">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Welcome to Google Maps
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Get directions, find places, and explore the world around
                      you.
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                        Get started
                      </button>
                      <button className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded">
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Panel */}
        {routeInfo && (
          <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
            <div className="p-4">
              <RoutePanel
                route={route}
                routeInfo={routeInfo}
                onStartNavigation={handleStartNavigation}
                onClearRoute={handleClearRoute}
                onShare={() => setShowShareModal(true)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Departure Time Modal */}
      {showDepartureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Departure Time
              </h3>
              <button
                onClick={() => setShowDepartureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setDepartureTime("now");
                  setShowDepartureModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border ${
                  departureTime === "now"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">Leave now</div>
                <div className="text-sm text-gray-500">Current time</div>
              </button>
              <button
                onClick={() => {
                  setDepartureTime("8:00 AM");
                  setShowDepartureModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border ${
                  departureTime === "8:00 AM"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">8:00 AM</div>
                <div className="text-sm text-gray-500">Tomorrow</div>
              </button>
              <button
                onClick={() => {
                  setDepartureTime("2:00 PM");
                  setShowDepartureModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border ${
                  departureTime === "2:00 PM"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">2:00 PM</div>
                <div className="text-sm text-gray-500">Tomorrow</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Route Options
              </h3>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={routeOptions.avoidTolls}
                  onChange={(e) =>
                    setRouteOptions({
                      ...routeOptions,
                      avoidTolls: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Avoid tolls
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={routeOptions.avoidHighways}
                  onChange={(e) =>
                    setRouteOptions({
                      ...routeOptions,
                      avoidHighways: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Avoid highways
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={routeOptions.avoidFerries}
                  onChange={(e) =>
                    setRouteOptions({
                      ...routeOptions,
                      avoidFerries: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Avoid ferries
                </span>
              </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOptionsModal(false);
                  // Here you would recalculate the route with new options
                  console.log("Route options updated:", routeOptions);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Stop</h3>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for a place to add as a stop
                </label>
                <SearchBar
                  onLocationSelect={(lng, lat, address) => {
                    console.log("Stop added:", { lng, lat, address });
                    setShowAddStopModal(false);
                    // Here you would add the stop to the route
                  }}
                  placeholder="Search for a stop..."
                  className="w-full"
                />
              </div>
              <div className="text-sm text-gray-500">
                Click on the map or search for a location to add it as a
                waypoint.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Route Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {routeInfo ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {routeInfo.summary}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(routeInfo.distance / 1000)} km •{" "}
                        {Math.round(routeInfo.duration / 60)} min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        {transportMode.charAt(0).toUpperCase() +
                          transportMode.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Start</div>
                      <div className="text-sm text-gray-500">
                        {origin?.address || "Starting point"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">End</div>
                      <div className="text-sm text-gray-500">
                        {destination?.address || "Destination"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Step-by-step directions would be displayed here in a real
                  implementation.
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No route selected. Please choose origin and destination first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Route Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Share Route
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share this route
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={
                      routeInfo && origin && destination
                        ? generateShareUrl()
                        : "No route to share"
                    }
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={async () => {
                      if (routeInfo && origin && destination) {
                        try {
                          await navigator.clipboard.writeText(generateShareUrl());
                          alert("Link copied to clipboard!");
                        } catch (error) {
                          console.error("Clipboard error:", error);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialShare("twitter")}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => handleSocialShare("facebook")}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
              <button
                onClick={handleShare}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Share via Web Share API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
