const { Sequelize } = require('sequelize');

function assertDatabaseEnv() {
  const missing = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter((key) => {
    const value = process.env[key];
    return !value || String(value).trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required database environment variables: ${missing.join(', ')}`);
  }
}

function createSequelize() {
  assertDatabaseEnv();
  const database = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const instanceName = process.env.DB_INSTANCE_NAME?.trim();
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
  const dialect = process.env.DB_DIALECT || 'mssql';
  const mssqlOptions = {
    encrypt: false,
    trustServerCertificate: true,
    ...(instanceName ? { instanceName } : {}),
  };

  return new Sequelize(database, username, password, {
    host,
    ...(port ? { port } : {}),
    dialect,
    logging: false,
    dialectOptions: dialect === 'mssql'
      ? {
          options: mssqlOptions,
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

const sequelize = createSequelize();

async function testDatabaseConnection() {
  await sequelize.authenticate();
}

module.exports = { sequelize, testDatabaseConnection };
