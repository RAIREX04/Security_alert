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
  const port = Number(process.env.DB_PORT || 1433);
  const dialect = process.env.DB_DIALECT || 'mssql';

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging: false,
    dialectOptions: dialect === 'mssql'
      ? {
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
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
