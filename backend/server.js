const express = require("express");
const https = require("https");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
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
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "https://ik.imagekit.io/piotr/", "data:"],
    },
  })
);

// Routes configuration
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);

// Socket.io
const sio = require("socket.io")(server, {
  cors: corsOptions,
  transports: ["websocket"],
});
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

sio.use(wrap(sessionMiddleware));
sio.use(wrap(passport.initialize()));
sio.use(wrap(passport.session()));

sio.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("Forbidden!"));
  }
});

const socketServer = require("./socket/socketServer.js");
socketServer(sio);

// Host static frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/^\/(?!api).*/, (_, res) => {
  res.sendFile(path.join(__dirname, "../", "frontend", "dist", "index.html"));
});

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
