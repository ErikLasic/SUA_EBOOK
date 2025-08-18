require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const routes = require("./routes/events.routes");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.get("/health", (_req,res)=>res.json({status:"ok"}));
app.use("/", routes);

const PORT = process.env.PORT || 10000; // Render poda PORT env
(async () => {
  await mongoose.connect(process.env.MONGO_URL, { maxPoolSize: 10 });
  app.listen(PORT, "0.0.0.0", () => console.log(`activity-log-service on :${PORT}`));
})();