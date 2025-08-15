require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const routes = require("./routes/loans.routes");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, "docs", "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.get("/docs.json", (_req, res) => res.json(swaggerDocument));

// routes
app.use("/", routes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.redirect("/docs"));

const PORT = process.env.PORT || 5002;
const MONGO_URL = process.env.MONGO_URL;

let server;
(async () => {
  try {
    if (!MONGO_URL) throw new Error("Missing MONGO_URL");
    await mongoose.connect(MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    console.log("? MongoDB connected");

    server = app.listen(PORT, () => {
      console.log(`? loan-service @ http://localhost:${PORT}`);
      console.log(`?? Swagger:      http://localhost:${PORT}/docs`);
    });
  } catch (e) {
    console.error("? Startup error:", e.message);
    process.exit(1);
  }
})();

const shutdown = async (sig) => {
  console.log(`\n?  ${sig} received, shutting down...`);
  if (server) await new Promise((r) => server.close(r));
  await mongoose.connection.close();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
