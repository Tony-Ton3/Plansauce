import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import utilRoutes from "./routes/util.route.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/api", utilRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

//error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
