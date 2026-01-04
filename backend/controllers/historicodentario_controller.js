const db = require('../models');
const { getPkField, nextIntPk, todayDateOnly } = require('./_clinical_controller_utils');

const model = db.historicodentario;

exports.findAll = async (req, res) => {
    try {
        const items = await model.findAll();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.findByPaciente = async (req, res) => {
    try {
        const utenteId = req.params.utenteId;
        const items = await model.findAll({
            where: { numero_utente: String(utenteId) },
            order: [
                ['data_registo', 'DESC'],
                ['id_historico_dentario', 'DESC'],
            ],
        });
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
        const pk = getPkField(model, 'id_historico_dentario');
        const body = { ...req.body };

        if (body[pk] == null) {
            body[pk] = await nextIntPk(model, pk);
        }
        if (!body.data_registo) {
            body.data_registo = todayDateOnly();
        }

        const created = await model.create(body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = getPkField(model, 'id_historico_dentario');
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
        const pk = getPkField(model, 'id_historico_dentario');
        const where = {};
        where[pk] = req.params.id;
        const num = await model.destroy({ where });
        if (num === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};