import React, { useState, useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { NavigationPage } from "./pages/NavigationPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    // Handle browser navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/navigation") {
        setCurrentPage("navigation");
      } else {
        setCurrentPage("home");
      }
    };

    // Listen for browser back/forward
    window.addEventListener("popstate", handlePopState);

    // Check initial route
    const path = window.location.pathname;
    if (path === "/navigation") {
      setCurrentPage("navigation");
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateToPage = (page) => {
    setCurrentPage(page);
    if (page === "navigation") {
      window.history.pushState({}, "", "/navigation");
    } else {
      window.history.pushState({}, "", "/");
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = () => {
      if (window.location.pathname === "/") {
        setCurrentPage("home");
      } else if (window.location.pathname === "/navigation") {
        setCurrentPage("navigation");
      }
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  return (
    <div className="App">
      {currentPage === "home" ? (
        <HomePage onNavigateToMap={() => navigateToPage("navigation")} />
      ) : (
        <NavigationPage onNavigateToHome={() => navigateToPage("home")} />
      )}
    </div>
  );
};

export default App;
