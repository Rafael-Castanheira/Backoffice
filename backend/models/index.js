const path = require('path');
const Sequelize = require('sequelize');
// Load environment variables from .env for convenient local development
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // ignore; dotenv may not be installed in some environments
}

const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '..', 'config', 'config.json');
const configs = require(configPath);
const config = configs[env];

let sequelize;
// Priority 1: DATABASE_URL or env specified config
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
} else if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Fallback to config file values, but allow environment overrides for each field
  const dbName = process.env.DB_NAME || config.database;
  const dbUser = process.env.DB_USER || config.username;
  const dbPass = process.env.DB_PASS || config.password;
  const dbHost = process.env.DB_HOST || config.host;
  const dbDialect = process.env.DB_DIALECT || config.dialect || 'postgres';

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: dbDialect,
    logging: false,
  });
}

const initModels = require('./init-models');
const models = initModels(sequelize);

// expose sequelize instances
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
