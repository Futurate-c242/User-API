const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(bodyParser.json()); // Parsing body request sebagai JSON

// Rute API
app.use("/api/auth", authRoutes);

// Jalankan server
const port = process.env.PORT || 3000; // Port default 3000
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
