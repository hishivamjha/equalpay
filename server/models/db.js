const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1/equalpay";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("db is connected");
  })
  .catch((err) => {
    console.log("db connection error:", err.message);
  });

module.exports = mongoose;
