const mongoose = require("mongoose");

require("dotenv").config();

const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || 27017;
const db = process.env.DB_NAME || "portaly";

const mongoUri = `mongodb://${host}:${port}/${db}`;

// mongodb://[<user>:<pass>@]mongo.domain.ext[:<port>]/Database

const connectToMongo = async () => {
  try {
    const ans = await mongoose.connect(mongoUri);
    const connData = `${ans.connection.host}:${ans.connection.port}/${ans.connection.name}`;
    console.log(`Connected to MongoDB: mongodb://${connData}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
