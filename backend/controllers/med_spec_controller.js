const { models } = require('../config/db');

exports.create = async (req, res) => {
  try {
    const rec = await models.MED_SPEC.create(req.body);
    res.status(201).send(rec);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.findAll = async (req, res) => {
  try { res.send(await models.MED_SPEC.findAll()); } catch (err) { res.status(500).send({ message: err.message }); }
};

// For composite PK, find by both ids in params
exports.findOne = async (req, res) => {
  try {
    const { medicoId, especialidadeId } = req.params;
    const rec = await models.MED_SPEC.findOne({ where: { id_medico: medicoId, id_especialidade: especialidadeId } });
    if (!rec) return res.status(404).send({ message: 'Not found' });
    res.send(rec);
  } catch (err) { res.status(500).send({ message: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const { medicoId, especialidadeId } = req.params;
    const num = await models.MED_SPEC.destroy({ where: { id_medico: medicoId, id_especialidade: especialidadeId } });
    if (num === 0) return res.status(404).send({ message: 'Not found' });
    res.status(204).send();
  } catch (err) { res.status(500).send({ message: err.message }); }
};
