const express = require("express");
const cors = require("cors");
require("dotenv").config();

const weatherRoutes = require("./routes/weather");
const favoritesRoutes = require("./routes/favorites");
const authRoutes = require("./routes/auth");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5000", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Enable if you're using cookies/sessions
};

// Middleware
app.use(cors(corsOptions.origin));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/favorites", favoritesRoutes);

// Export the app as a serverless function handler
module.exports = (req, res) => {
  app(req, res);
};
