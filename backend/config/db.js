// Compatibility layer: expose models with uppercase keys as the controllers expect
const db = require('../models');

const mapped = {};
Object.keys(db).forEach((k) => {
  if (k === 'sequelize' || k === 'Sequelize') return;
  // map to uppercase key (e.g., consulta -> CONSULTA)
  mapped[k.toUpperCase()] = db[k];
});

module.exports = {
  models: mapped,
  sequelize: db.sequelize,
  Sequelize: db.Sequelize,
};
