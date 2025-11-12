import React from "react";

export const RoutePanel = ({
  route,
  routeInfo,
  onStartNavigation,
  onClearRoute,
  onShare,
  isNavigating = false,
  className = "",
}) => {
  if (!route || !routeInfo) {
    return null;
  }

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      {/* Google Maps Style Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            <div>
              <h3 className="font-medium text-gray-900">Directions</h3>
              <p className="text-sm text-gray-500">Driving route</p>
            </div>
          </div>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Route Summary - Google Maps Style */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Route Overview */}
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {routeInfo.summary}
              </p>
            </div>
          </div>

          {/* Route Stats */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatDistance(routeInfo.distance)}
                </div>
                <div className="text-xs text-gray-500">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(routeInfo.duration)}
                </div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
            </div>
          </div>

          {/* Traffic Info */}
          {routeInfo.durationInTraffic &&
            routeInfo.durationInTraffic !== routeInfo.duration && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <svg
                  className="w-4 h-4 text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="text-sm font-medium text-orange-800">
                    Traffic delays
                  </div>
                  <div className="text-sm text-orange-700">
                    +
                    {formatDuration(
                      routeInfo.durationInTraffic - routeInfo.duration
                    )}{" "}
                    due to traffic
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-3">
          {onStartNavigation && (
            <button
              onClick={onStartNavigation}
              className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isNavigating
                  ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                  : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {isNavigating ? (
                  <>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Stop navigation</span>
                  </>
                ) : (
                  <>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Start navigation</span>
                  </>
                )}
              </div>
            </button>
          )}

          <div className="flex space-x-2">
            <button className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">
              Details
            </button>
            <button
              onClick={onShare}
              className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
