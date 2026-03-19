import express from "express";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(express.json());

// Routes
app.use("/sessions", sessionRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Global error handler
app.use(errorHandler);

export default app;
