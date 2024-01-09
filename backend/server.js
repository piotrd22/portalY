const express = require("express");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const sessionMiddleware = require("./config/session");
const passport = require("./config/passport");

require("dotenv").config();

const app = express();

// Setting up the HTTPS server
const server = https.createServer(
  {
    key: fs.readFileSync("./ssl/my.key"),
    cert: fs.readFileSync("./ssl/my.crt"),
  },
  app
);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Additional middleware, e.g., session handling, cookies, etc.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes configuration
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);

// Application startup
const start = async () => {
  const connectToMongo = require("./config/dbConnection");
  await connectToMongo();

  const port = process.env.API_PORT || 3000;
  const host = process.env.API_HOST || "localhost";
  server.listen(port, () => {
    console.log(`API server available from: https://${host}:${port}`);
  });
};

start().catch((err) => console.error(err));
