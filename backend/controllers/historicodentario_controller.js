const db = require('../models');

const model = db.historicodentario;

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

        if (data) res.send(data);
        else res.status(404).send({ message: "Registo não encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 4. Atualizar
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [num] = await models.HISTORICODENTARIO.update(req.body, {
            where: { ID_HISTORICO_DENTARIO: id }
        });

        if (num == 1) res.send({ message: "Atualizado com sucesso." });
        else res.send({ message: "Não foi possível atualizar." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 5. Apagar
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const num = await models.HISTORICODENTARIO.destroy({
            where: { ID_HISTORICO_DENTARIO: id }
        });

        if (num == 1) res.send({ message: "Apagado com sucesso!" });
        else res.send({ message: "Não encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};