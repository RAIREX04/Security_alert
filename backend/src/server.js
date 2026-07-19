require('dotenv').config();
const { createApp } = require('./app');
const { syncDatabase } = require('./models');
const { testDatabaseConnection } = require('./config/database');
const { resolveListenHost } = require('./config/listen-host');
const { ensureSeedData } = require('./services/seed.service');
const { logInfo, logError } = require('./utils/logger');

async function bootstrap() {
  try {
    await testDatabaseConnection();
    await syncDatabase();
    await ensureSeedData();

    const app = createApp();
    const port = Number(process.env.PORT || 3000);
    const configuredHost = process.env.LOCAL_BACKEND_HOST || process.env.HOST;
    const hostConfig = resolveListenHost(configuredHost);
    const { host } = hostConfig;

    if (hostConfig.didFallback) {
      logInfo('Configured backend host is not available; falling back to localhost', {
        configuredHost: hostConfig.configuredHost,
        fallbackHost: host,
      });
    }

    app.listen(port, host, () => {
      logInfo('Backend started', {
        host,
        port,
        configuredHost: hostConfig.configuredHost,
        baseUrl: `http://${host}:${port}`,
      });
    });
  } catch (error) {
    logError('Backend bootstrap failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();
