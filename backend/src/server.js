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

    app.listen(port, () => {
      logInfo('Backend started', { port });
    });
  } catch (error) {
    logError('Backend bootstrap failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();
