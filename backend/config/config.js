const path = require('path');

// Load .env from backend/.env for local development.
// In production, environment variables should be provided by the runtime.
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // ignore; dotenv may not be installed in some environments
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalNumber(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid number for environment variable ${name}: ${raw}`);
  }
  return num;
}

/**
 * Returns DB config derived ONLY from process.env.
 * - If DATABASE_URL is provided, it takes priority.
 * - Otherwise, DB_NAME/DB_USER/DB_HOST are required.
 */
function getDatabaseConfig() {
  if (process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim() !== '') {
    return {
      url: process.env.DATABASE_URL,
      logging: false,
    };
  }

  return {
    name: getRequiredEnv('DB_NAME'),
    user: getRequiredEnv('DB_USER'),
    pass: process.env.DB_PASS || '',
    host: getRequiredEnv('DB_HOST'),
    port: getOptionalNumber('DB_PORT'),
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  };
}

module.exports = {
  getDatabaseConfig,
};
