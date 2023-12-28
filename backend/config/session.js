const expressSession = require("express-session");

require("dotenv").config();

const sessionSecret = process.env.APP_SECRET || "$sekretny $sekret";

// I use sessions for authorization, but thanks to using the MongoDB store, I can scale the applications better (use load balancers, etc.)

const MongoStore = require("connect-mongodb-session")(expressSession);
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || "portaly";
const sessionCollection = process.env.DB_SESSION_COLLECTION || "appSessions";
const mongoStore = new MongoStore({
  uri: `mongodb://${dbHost}:${dbPort}`,
  databaseName: dbName,
  collection: sessionCollection,
});
mongoStore.on("error", (err) => {
  console.log(err);
});

const sessionMiddleware = expressSession({
  secret: sessionSecret,
  saveUninitialized: false,
  resave: false,
  expires: 1000 * 60 * 60 * 24 * 30, // 30 days
  store: mongoStore,
});

module.exports = sessionMiddleware;
