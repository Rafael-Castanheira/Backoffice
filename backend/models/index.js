const path = require('path');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '..', 'config', 'config.json');
const configs = require(configPath);
const config = configs[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const initModels = require('./init-models');
const db = initModels(sequelize);

// expose sequelize instances similar to sequelize-cli generated file
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
