require('dotenv').config();
const { createApp } = require('./app');
const { syncDatabase } = require('./models');
const { testDatabaseConnection } = require('./config/database');
const { ensureSeedData } = require('./services/seed.service');
const { logInfo, logError } = require('./utils/logger');

async function bootstrap() {
  try {
    await testDatabaseConnection();
    await syncDatabase();
    await ensureSeedData();

    const app = createApp();
    const port = Number(process.env.PORT || 3000);
    const host = process.env.LOCAL_BACKEND_HOST || process.env.HOST || '127.0.0.1';

    app.listen(port, host, () => {
      logInfo('Backend started', { host, port, baseUrl: `http://${host}:${port}` });
    });
  } catch (error) {
    logError('Backend bootstrap failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();
