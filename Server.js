const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express(); // ✅ app is created first

const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
