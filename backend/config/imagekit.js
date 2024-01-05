const ImageKit = require("imagekit");

require("dotenv").config();

const PUBILC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "publickey";
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "privatekey";
const URL = process.env.IMAGEKIT_URL || "url";

const imagekit = new ImageKit({
  publicKey: PUBILC_KEY,
  privateKey: PRIVATE_KEY,
  urlEndpoint: URL,
});

module.exports = imagekit;
