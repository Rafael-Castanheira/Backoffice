const db = require('../models');

const model = db.especialidade;

const getPk = (m) => (m && m.primaryKeyAttributes && m.primaryKeyAttributes[0]) || 'id';

exports.findAll = async (req, res) => {
    try {
        const items = await model.findAll();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const item = await model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const created = await model.create(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = getPk(model);
        const where = {};
        where[pk] = req.params.id;
        const [num] = await model.update(req.body, { where });
        if (num === 0) return res.status(404).json({ message: 'Not found' });
        const updated = await model.findOne({ where });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = getPk(model);
        const where = {};
        where[pk] = req.params.id;
        const num = await model.destroy({ where });
        if (num === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
