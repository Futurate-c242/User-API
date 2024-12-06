const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(bodyParser.json()); // Parsing body request sebagai JSON

// Rute API
app.use("/User-API/auth", authRoutes);

// Jalankan server
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
