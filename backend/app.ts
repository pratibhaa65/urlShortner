import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import shortenerRoutes from "./routes/shortener.routes.js";
import { redirectToShortLink } from "./controllers/shortener.controller.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/links", shortenerRoutes);

// Public redirect route
app.get("/:shortCode", redirectToShortLink);

export default app;   