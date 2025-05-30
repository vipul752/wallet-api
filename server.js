import express from "express";
import cors from "cors";
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(rateLimiter);
app.use(express.json());

if (process.env.NODE_ENV === "production") job.start();

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

async function startServer() {
  await initDB();
  app.use("/api/transactions", transactionsRoute);
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
