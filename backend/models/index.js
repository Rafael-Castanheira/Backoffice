const path = require('path');
const Sequelize = require('sequelize');

// Load environment variables from backend/.env for local development.
// This keeps dev-scripts that import models working without needing index.js.
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // ignore
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

function getDatabaseConfigFromEnv() {
  if (process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim() !== '') {
    return { url: process.env.DATABASE_URL };
  }

  return {
    name: getRequiredEnv('DB_NAME'),
    user: getRequiredEnv('DB_USER'),
    pass: process.env.DB_PASS || '',
    host: getRequiredEnv('DB_HOST'),
    port: getOptionalNumber('DB_PORT'),
    dialect: process.env.DB_DIALECT || 'postgres',
  };
}

const dbCfg = getDatabaseConfigFromEnv();

let sequelize;

if (dbCfg.url) {
  // Render (produção)
  sequelize = new Sequelize(dbCfg.url, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local (desenvolvimento)
  sequelize = new Sequelize(dbCfg.name, dbCfg.user, dbCfg.pass, {
    host: dbCfg.host,
    port: dbCfg.port,
    dialect: dbCfg.dialect,
    logging: false
  });
}


const initModels = require('./init-models');
const models = initModels(sequelize);

// expose sequelize instances
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

