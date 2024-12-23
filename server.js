const express = require("express");
const authRoutes = require("./routes/auth");
const profileRouter = require('./routes/auth'); // Menyesuaikan dengan file router

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
