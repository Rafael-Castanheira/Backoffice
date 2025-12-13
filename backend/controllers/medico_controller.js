const { models } = require('../config/db');

// CRUD for Medico
exports.create = async (req, res) => {
  try {
    const record = await models.MEDICO.create(req.body);
    res.status(201).send(record);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const records = await models.MEDICO.findAll();
    res.send(records);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const rec = await models.MEDICO.findByPk(id);
    if (!rec) return res.status(404).send({ message: 'Not found' });
    res.send(rec);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const rec = await models.MEDICO.findByPk(id);
    if (!rec) return res.status(404).send({ message: 'Not found' });
    await rec.update(req.body);
    res.send({ message: 'Updated' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const rec = await models.MEDICO.findByPk(id);
    if (!rec) return res.status(404).send({ message: 'Not found' });
    await rec.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
