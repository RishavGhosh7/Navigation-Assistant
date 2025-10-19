import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Root API endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Maps API", version: "1.0.0" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Export the Express app for Vercel
export default app;
