const crypto = require('crypto');

function getPkField(model, fallback = 'id') {
  return (model && model.primaryKeyAttributes && model.primaryKeyAttributes[0]) || fallback;
}

async function nextIntPk(model, pkField) {
  const max = await model.max(pkField);
  const maxNumber = typeof max === 'number' ? max : Number(max);
  const next = (Number.isFinite(maxNumber) ? maxNumber : 0) + 1;
  return next;
}

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function uuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  getPkField,
  nextIntPk,
  todayDateOnly,
  uuid,
};
