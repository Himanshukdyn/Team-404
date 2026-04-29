import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import specs from './config/swagger.js';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());       //For interaction b/w frontend and backend on different port.
app.use(express.json());  //convert json data in req body to JS object
app.use(morgan("dev"));   // for logging purpose for easy debugging.

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Default route
app.get("/", (req, res) => res.send("Workflow System API running..."));

// Health check route
app.get("/check", (req, res) => {
  res.send("✅ Auth routes are mounted correctly");
});
app.get("/routes", (req, res) => {
  res.json({
    auth: "/api/auth/signup or /api/auth/login",
    workflow: "/api/workflow"
  });
});


export default app;
