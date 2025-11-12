import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./database.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ error: "Server error during registration" });
        }

        if (existingUser) {
          return res.status(409).json({ error: "Email already registered" });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert user
        db.run(
          "INSERT INTO users (email, password_hash) VALUES (?, ?)",
          [email, password_hash],
          function (err) {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ error: "Server error during registration" });
            }

            // Generate JWT token
            const token = jwt.sign(
              { userId: this.lastID, email },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            res.status(201).json({
              message: "User registered successfully",
              token,
              user: { id: this.lastID, email },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Server error during login" });
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isValidPassword) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          message: "Login successful",
          token,
          user: { id: user.id, email: user.email },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
