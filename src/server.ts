import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
