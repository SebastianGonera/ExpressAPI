import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import cors from "cors";

import authorRoute from "./routes/authorRoutes.js";
import bookRoute from "./routes/bookRoutes.js";
import userRoute from "./routes/userRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import uploadRouter from "./routes/uploadRoute.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

dotenv.config();
const dbURL = process.env.MONGODB_URI;

await mongoose.connect(dbURL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error during connecting to MongoDB:', err.message);
  });

app.use("/api/authors", authorRoute);
app.use("/api/books", bookRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRouter);

const port = 5000;
app.listen(port, () => {
  console.info(`Server is running on port ${port}`);
  console.log('http://localhost:5000/');
});