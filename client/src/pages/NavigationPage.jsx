import React, { useState, useCallback, useEffect } from "react";
import { WorkingMap } from "../components/WorkingMap";
import { SearchBar } from "../components/SearchBar";
import { RoutePanel } from "../components/RoutePanel";

export const NavigationPage = ({ onNavigateToHome }) => {
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
          distance: routeData.distance, // meters
          duration: routeData.duration, // seconds
          summary: `${from.address} → ${to.address}`,
        });
      } else {
        throw new Error("No route found");
      }
    } catch (err) {
      console.error("Route calculation error:", err);
      setError(err.message || "Failed to calculate route");
      setRoute(null);
      setRouteInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const [isNavigating, setIsNavigating] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Voice assistant states
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });
  const [currentInstruction, setCurrentInstruction] = useState("");

  // Route options
  const [waypoints, setWaypoints] = useState([]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Current location:", latitude, longitude);

        // Reverse geocode to get address
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((response) => response.json())
          .then((data) => {
            const address =
              data.display_name ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            const location = { lat: latitude, lng: longitude, address };
            setCurrentLocation(location);
            console.log("Current location address:", address);
            setIsGettingLocation(false);
          })
          .catch((error) => {
            console.error("Geocoding error:", error);
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
            setIsGettingLocation(false);
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to retrieve your location. Please try again.");
        setIsGettingLocation(false);
      }
    );
  }, []);

  const handleStartNavigation = () => {
    console.log("Starting navigation...");
    setIsNavigating(true);
    setShowNavigationModal(true);
  };

  const handleStopNavigation = () => {
    console.log("Stopping navigation...");
    setIsNavigating(false);
    setShowNavigationModal(false);
  };

  const handleStartDriving = () => {
    console.log("Starting driving mode...");
    // Keep navigation active but close the modal
    setShowNavigationModal(false);
  };

  // Departure time handlers
  const handleDepartureTimeChange = (time) => {
    setDepartureTime(time);
    setShowDepartureModal(false);
  };

  // Route options handlers
  const handleRouteOptionChange = (option) => {
    setRouteOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // Add stop handlers
  const handleAddStop = (lng, lat, address) => {
    const newStop = { lng, lat, address };
    setWaypoints((prev) => [...prev, newStop]);
    setShowAddStopModal(false);
  };

  const handleRemoveStop = (index) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
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

    return `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;
  };

  const handleShare = async () => {
    if (!routeInfo || !origin || !destination) {
      alert("Please select a route first");
      return;
    }

    const shareUrl = generateShareUrl();
    const shareText = `Route: ${origin.address} → ${
      destination.address
    }\nDistance: ${(routeInfo.distance / 1000).toFixed(
      1
    )} km\nDuration: ${Math.round(
      routeInfo.duration / 60
    )} min\n\nView route: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Navigation Route",
          text: `Route from ${origin.address} to ${destination.address}`,
          url: shareUrl,
        });
        setShowShareModal(false);
      } catch (error) {
        // User cancelled or error occurred, fall through to clipboard
        if (error.name !== "AbortError") {
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

  // Voice assistant functions
  const speak = useCallback(
    (text) => {
      if (!isVoiceEnabled || !("speechSynthesis" in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }

      utterance.onstart = () => console.log("Voice: Speaking started");
      utterance.onend = () => console.log("Voice: Speaking ended");
      utterance.onerror = (event) => console.error("Voice error:", event.error);

      window.speechSynthesis.speak(utterance);
    },
    [isVoiceEnabled, voiceSettings]
  );

  const initializeVoice = useCallback(() => {
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer English voices
        const englishVoice =
          voices.find(
            (voice) =>
              voice.lang.startsWith("en") && voice.name.includes("Google")
          ) ||
          voices.find((voice) => voice.lang.startsWith("en")) ||
          voices[0];

        setVoiceSettings((prev) => ({ ...prev, voice: englishVoice }));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      speak("Listening for your command");
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice command:", command);

      // Process voice commands
      if (
        command.includes("start navigation") ||
        command.includes("begin navigation")
      ) {
        handleStartNavigation();
        speak("Starting navigation");
      } else if (
        command.includes("stop navigation") ||
        command.includes("end navigation")
      ) {
        handleStopNavigation();
        speak("Stopping navigation");
      } else if (
        command.includes("mute voice") ||
        command.includes("turn off voice")
      ) {
        setIsVoiceEnabled(false);
        speak("Voice guidance disabled");
      } else if (
        command.includes("enable voice") ||
        command.includes("turn on voice")
      ) {
        setIsVoiceEnabled(true);
        speak("Voice guidance enabled");
      } else if (
        command.includes("repeat instruction") ||
        command.includes("say again")
      ) {
        if (currentInstruction) {
          speak(currentInstruction);
        } else {
          speak("No current instruction to repeat");
        }
      } else {
        speak(
          "Command not recognized. Try saying 'start navigation', 'stop navigation', or 'mute voice'"
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      speak("Sorry, I didn't catch that. Please try again");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speak, currentInstruction]);

  const generateNavigationInstructions = useCallback((routeData) => {
    if (!routeData || !routeData.features || !routeData.features[0]) return;

    const route = routeData.features[0];
    const coordinates = route.geometry.coordinates;

    // Generate simple turn-by-turn instructions
    const instructions = [];

    if (coordinates.length > 1) {
      // Calculate bearing for first segment
      const start = coordinates[0];
      const next = coordinates[Math.floor(coordinates.length / 4)];
      const bearing = calculateBearing(start[1], start[0], next[1], next[0]);

      let direction = getDirectionFromBearing(bearing);
      instructions.push(
        `Head ${direction} for ${Math.round(
          route.properties.distance / 1000
        )} kilometers`
      );
    }

    // Add intermediate instructions
    const midPoint = Math.floor(coordinates.length / 2);
    if (midPoint > 0 && midPoint < coordinates.length - 1) {
      const mid = coordinates[midPoint];
      const next = coordinates[midPoint + 1];
      const bearing = calculateBearing(mid[1], mid[0], next[1], next[0]);
      const direction = getDirectionFromBearing(bearing);
      instructions.push(`Continue ${direction}`);
    }

    // Final instruction
    instructions.push(`You have arrived at your destination`);

    return instructions;
  }, []);

  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  const getDirectionFromBearing = (bearing) => {
    const directions = [
      "north",
      "northeast",
      "east",
      "southeast",
      "south",
      "southwest",
      "west",
      "northwest",
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // Auto-fetch current location on component mount
  useEffect(() => {
    getCurrentLocation();
    initializeVoice();
  }, [getCurrentLocation, initializeVoice]);

  // Parse URL parameters to restore shared route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const originParam = params.get("origin");
    const originAddress = params.get("originAddress");
    const destinationParam = params.get("destination");
    const destinationAddress = params.get("destinationAddress");

    if (
      originParam &&
      destinationParam &&
      originAddress &&
      destinationAddress
    ) {
      try {
        const [originLat, originLng] = originParam.split(",").map(Number);
        const [destLat, destLng] = destinationParam.split(",").map(Number);

        if (
          !isNaN(originLat) &&
          !isNaN(originLng) &&
          !isNaN(destLat) &&
          !isNaN(destLng)
        ) {
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

  // Voice guidance when navigation starts
  useEffect(() => {
    if (isNavigating && route && isVoiceEnabled) {
      const instructions = generateNavigationInstructions(route);
      if (instructions && instructions.length > 0) {
        const firstInstruction = instructions[0];
        setCurrentInstruction(firstInstruction);
        speak(`Navigation started. ${firstInstruction}`);
      }
    }
  }, [
    isNavigating,
    route,
    isVoiceEnabled,
    generateNavigationInstructions,
    speak,
  ]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Google Maps Style */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={onNavigateToHome}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Navigation Assistant Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div className="text-gray-700 font-medium text-lg">
                  Navigation Assistant
                </div>
              </div>
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
                  {currentLocation && (
                    <button
                      onClick={() =>
                        handleOriginSelect(
                          currentLocation.lng,
                          currentLocation.lat,
                          currentLocation.address
                        )
                      }
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="Use current location"
                    >
                      📍 Current
                    </button>
                  )}
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
                  {currentLocation && (
                    <button
                      onClick={() =>
                        handleDestinationSelect(
                          currentLocation.lng,
                          currentLocation.lat,
                          currentLocation.address
                        )
                      }
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="Use current location"
                    >
                      📍 Current
                    </button>
                  )}
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

          {/* Location Error */}
          {locationError && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-700 font-medium">
                  {locationError}
                </span>
                <button
                  onClick={getCurrentLocation}
                  className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Location Status */}
          {currentLocation && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 font-medium">
                  Location found!
                </span>
                <span className="text-green-600 text-sm truncate">
                  {currentLocation.address}
                </span>
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

            {/* Voice Assistant Button */}
            <button
              onClick={startListening}
              disabled={isListening}
              className={`w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${
                isListening ? "opacity-50 cursor-not-allowed" : ""
              } ${isVoiceEnabled ? "text-blue-500" : "text-gray-400"}`}
              title={isListening ? "Listening..." : "Voice commands"}
            >
              {isListening ? (
                <div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Voice Toggle Button */}
            <button
              onClick={() => {
                setIsVoiceEnabled(!isVoiceEnabled);
                if (isVoiceEnabled) {
                  speak("Voice guidance disabled");
                } else {
                  speak("Voice guidance enabled");
                }
              }}
              className={`w-10 h-10 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${
                isVoiceEnabled
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-400"
              }`}
              title={isVoiceEnabled ? "Voice enabled" : "Voice disabled"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {isVoiceEnabled ? (
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>

            {/* My Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className={`w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${
                isGettingLocation ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={
                isGettingLocation
                  ? "Getting location..."
                  : "Get my current location"
              }
            >
              {isGettingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
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
              )}
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

          {/* Welcome Message - Navigation Assistant Style */}
          {!origin && !destination && (
            <div className="absolute top-4 left-4 z-10 max-w-sm">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Welcome to Navigation Assistant
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Get voice-guided directions, find places, and navigate
                      with ease.
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
                onStartNavigation={
                  isNavigating ? handleStopNavigation : handleStartNavigation
                }
                onClearRoute={handleClearRoute}
                onShare={() => setShowShareModal(true)}
                isNavigating={isNavigating}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Navigation Status Bar */}
        {isNavigating && (
          <div className="absolute bottom-4 left-4 right-4 z-40">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Navigation Active
                    </p>
                    <p className="text-sm text-gray-600">
                      Following route to {destination?.address}
                    </p>
                    {currentInstruction && (
                      <p className="text-sm text-blue-600 mt-1">
                        🗣️ {currentInstruction}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isVoiceEnabled && (
                    <button
                      onClick={() =>
                        speak(currentInstruction || "No current instruction")
                      }
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      title="Repeat instruction"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={handleStopNavigation}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Modal */}
      {showNavigationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log("Modal backdrop clicked");
              setShowNavigationModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Navigation Started!
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Turn-by-turn directions are now active. Follow the route on the
              map.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  console.log("Stop navigation clicked");
                  handleStopNavigation();
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Stop Navigation
              </button>
              <button
                onClick={() => {
                  console.log("Start driving clicked");
                  handleStartDriving();
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Start Driving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departure Time Modal */}
      {showDepartureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Departure Time
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDepartureTimeChange("now")}
                className={`w-full p-3 text-left rounded-lg border ${
                  departureTime === "now"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium">Leave now</div>
                <div className="text-sm text-gray-500">Current time</div>
              </button>
              <button
                onClick={() => handleDepartureTimeChange("depart-at")}
                className={`w-full p-3 text-left rounded-lg border ${
                  departureTime === "depart-at"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium">Depart at</div>
                <div className="text-sm text-gray-500">Set specific time</div>
              </button>
              <button
                onClick={() => handleDepartureTimeChange("arrive-by")}
                className={`w-full p-3 text-left rounded-lg border ${
                  departureTime === "arrive-by"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium">Arrive by</div>
                <div className="text-sm text-gray-500">Set arrival time</div>
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDepartureModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Route Options
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Avoid tolls</div>
                  <div className="text-sm text-gray-500">
                    Route around toll roads
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={routeOptions.avoidTolls}
                  onChange={() => handleRouteOptionChange("avoidTolls")}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Avoid highways</div>
                  <div className="text-sm text-gray-500">
                    Use local roads when possible
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={routeOptions.avoidHighways}
                  onChange={() => handleRouteOptionChange("avoidHighways")}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Avoid ferries</div>
                  <div className="text-sm text-gray-500">
                    Route around ferry crossings
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={routeOptions.avoidFerries}
                  onChange={() => handleRouteOptionChange("avoidFerries")}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Stop</h3>
            <div className="mb-4">
              <SearchBar
                onLocationSelect={handleAddStop}
                placeholder="Search for a place to add as stop"
                className="w-full"
              />
            </div>
            {waypoints.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Current stops:
                </h4>
                <div className="space-y-2">
                  {waypoints.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {stop.address}
                      </span>
                      <button
                        onClick={() => handleRemoveStop(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddStopModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-lg mx-4 w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Route Details
            </h3>
            {routeInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Distance</div>
                    <div className="font-semibold">
                      {(routeInfo.distance / 1000).toFixed(1)} km
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-semibold">
                      {Math.round(routeInfo.duration / 60)} min
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">
                    Route Summary
                  </div>
                  <div className="font-medium">{routeInfo.summary}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">
                    Route Options
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Avoid tolls:</span>
                      <span>{routeOptions.avoidTolls ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avoid highways:</span>
                      <span>{routeOptions.avoidHighways ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avoid ferries:</span>
                      <span>{routeOptions.avoidFerries ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                {waypoints.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">Waypoints</div>
                    <div className="space-y-1">
                      {waypoints.map((stop, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          {index + 1}. {stop.address}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Share Route
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Route</div>
                <div className="font-medium">
                  {origin?.address} → {destination?.address}
                </div>
              </div>
              {routeInfo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Distance</div>
                    <div className="font-semibold">
                      {(routeInfo.distance / 1000).toFixed(1)} km
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-semibold">
                      {Math.round(routeInfo.duration / 60)} min
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Shareable Link</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={
                      origin && destination
                        ? generateShareUrl()
                        : "No route to share"
                    }
                    readOnly
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 truncate"
                  />
                  <button
                    onClick={async () => {
                      if (origin && destination) {
                        try {
                          await navigator.clipboard.writeText(
                            generateShareUrl()
                          );
                          alert("Link copied to clipboard!");
                        } catch (error) {
                          console.error("Clipboard error:", error);
                        }
                      }
                    }}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
