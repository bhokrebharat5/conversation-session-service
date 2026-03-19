import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/conversation-sessions",
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
