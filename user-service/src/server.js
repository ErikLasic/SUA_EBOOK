require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const { mountUserGraphQL } = require('./graphql');
const usersRoutes = require('./routes/users.routes');

const app = express();

// --- Middlewares (Helmet prilagojen, da GraphiQL ne ostane na "Loading...")
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.get('/docs.json', (_req, res) => res.json(swaggerDocument));

// REST rute
app.use('/api', usersRoutes);

// Health & root
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (_req, res) => res.redirect('/docs'));

// Error fallback
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Bootstrap
const PORT = process.env.PORT || 5001;
const MONGO_URL = process.env.MONGO_URL;

let server;
(async () => {
  try {
    if (!MONGO_URL) throw new Error('Missing MONGO_URL');

    await mongoose.connect(MONGO_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected');

    // ⬇️ Mount GraphQL (pred listen)
    mountUserGraphQL(app);

    server = app.listen(PORT, () => {
      console.log(`✅ user-service @ http://localhost:${PORT}`);
      console.log(`📚 Swagger:      http://localhost:${PORT}/docs`);
      console.log(`🔷 GraphQL:      http://localhost:${PORT}/graphql`);
    });
  } catch (e) {
    console.error('❌ Startup error:', e.message);
    process.exit(1);
  }
})();

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n⏹  ${signal} received, shutting down...`);
  if (server) await new Promise((r) => server.close(r));
  await mongoose.connection.close();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
