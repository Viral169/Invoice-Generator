import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectionDB } from "./config/db.js";
import invoiceRoutes from "./routes/invoice.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "https://invoice-genera.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Routes
app.use("/api/invoices", invoiceRoutes);

// Connect DB & Start server
connectionDB();
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});