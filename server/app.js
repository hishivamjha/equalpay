require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./Routes/Route");
require("./models/db");

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log("HTTP:" + req.method + req.url);
  next();
});
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
