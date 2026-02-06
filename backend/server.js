const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
app.use(express.json());

// routes
app.use("/api/leads", require("./routes/leads"));
app.use("/api/feedback", require("./routes/feedback"));

const PORT = 5000;

(async () => {
  await connectDB();   // ⬅️ wait for MongoDB first

  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
})();
