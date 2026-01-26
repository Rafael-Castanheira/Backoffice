const db = require('../models');

const model = db.consulta;

const getPk = (m) => (m && m.primaryKeyAttributes && m.primaryKeyAttributes[0]) || 'id';

function parseTimeToMinutes(timeLike) {
    if (!timeLike) return null;
    const s = String(timeLike).trim();
    const m = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(s);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    return hh * 60 + mm;
}

function rangesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

async function assertNoDoctorOverlap({ id_consulta = null, id_medico, data_hora_consulta, hora_consulta, duracao_min }) {
    const medicoId = id_medico != null ? Number(id_medico) : null;
    if (!medicoId || !data_hora_consulta) return;

    const startMin = parseTimeToMinutes(hora_consulta);
    const duration = duracao_min != null ? Number(duracao_min) : null;
    if (startMin == null || !duration || duration <= 0) return;

    const endMin = startMin + duration;

    const where = { id_medico: medicoId, data_hora_consulta };
    if (id_consulta != null) where.id_consulta = { [db.Sequelize.Op.ne]: Number(id_consulta) };

    const existing = await model.findAll({ where });
    for (const c of existing) {
        const exStart = parseTimeToMinutes(c.hora_consulta);
        const exDur = c.duracao_min != null ? Number(c.duracao_min) : null;
        if (exStart == null || !exDur || exDur <= 0) continue;
        const exEnd = exStart + exDur;

        if (rangesOverlap(startMin, endMin, exStart, exEnd)) {
            throw new Error('Conflito de horário: este médico já tem uma consulta nesse período.');
        }
    }
}

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
        await assertNoDoctorOverlap(req.body);
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

        const current = await model.findByPk(req.params.id);
        if (!current) return res.status(404).json({ message: 'Not found' });

        const merged = { ...current.toJSON(), ...req.body, id_consulta: current.id_consulta };
        await assertNoDoctorOverlap(merged);

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