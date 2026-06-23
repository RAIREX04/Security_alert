require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { buildCors } = require('./config/cors');
const { requestLogger } = require('./middlewares/request-logger.middleware');
const { notFound } = require('./middlewares/not-found.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const routes = require('./routes');
const { swaggerUi, spec } = require('./docs/swagger');

function createApp() {
  const app = express();
  app.set('trust proxy', true);

  app.use(helmet());
  app.use(buildCors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger());

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
  app.use('/uploads', express.static(uploadDir));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Management Emergency backend is running',
      data: {
        ok: true,
        service: 'management-emergency-backend',
        docs: '/docs',
        health: '/api/health',
      },
    });
  });

  app.get('/docs.json', (_req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
