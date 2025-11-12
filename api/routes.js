import express from "express";
import db from "./database.js";
import { authenticateToken } from "./middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's route history
router.get("/history", (req, res) => {
  const userId = req.user.userId;
  db.all(
    `
    SELECT id, origin, destination, route_data, timestamp 
    FROM route_history 
    WHERE user_id = ? 
    ORDER BY timestamp DESC
  `,
    [userId],
    (err, routes) => {
      if (err) {
        console.error("Error fetching route history:", err);
        return res.status(500).json({ error: "Failed to fetch route history" });
      }

      // Parse route_data JSON for each route
      const parsedRoutes = routes.map((route) => ({
        ...route,
        route_data: JSON.parse(route.route_data),
      }));

      res.json({ routes: parsedRoutes });
    }
  );
});

// Save a new route
router.post("/save", (req, res) => {
  const userId = req.user.userId;
  const { origin, destination, route_data } = req.body;

  // Validation
  if (!origin || !destination || !route_data) {
    return res
      .status(400)
      .json({ error: "Origin, destination, and route data are required" });
  }

  // Insert route
  db.run(
    `
    INSERT INTO route_history (user_id, origin, destination, route_data) 
    VALUES (?, ?, ?, ?)
  `,
    [userId, origin, destination, JSON.stringify(route_data)],
    function (err) {
      if (err) {
        console.error("Error saving route:", err);
        return res.status(500).json({ error: "Failed to save route" });
      }

      res.status(201).json({
        message: "Route saved successfully",
        routeId: this.lastID,
      });
    }
  );
});

// Delete a route
router.delete("/:id", (req, res) => {
  const userId = req.user.userId;
  const routeId = req.params.id;

  // Check if route exists and belongs to user
  db.get(
    "SELECT * FROM route_history WHERE id = ? AND user_id = ?",
    [routeId, userId],
    (err, route) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error during deletion" });
      }

      if (!route) {
        return res
          .status(404)
          .json({ error: "Route not found or unauthorized" });
      }

      // Delete route
      db.run("DELETE FROM route_history WHERE id = ?", [routeId], (err) => {
        if (err) {
          console.error("Error deleting route:", err);
          return res.status(500).json({ error: "Failed to delete route" });
        }

        res.json({ message: "Route deleted successfully" });
      });
    }
  );
});

export default router;
