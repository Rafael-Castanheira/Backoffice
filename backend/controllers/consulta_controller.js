const { models } = require('../config/db');
const { Op } = require('sequelize');

// 1. Agendar Consulta
exports.create = async (req, res) => {
    try {
        const { ID_MEDICO, NUMERO_UTENTE, DATA_HORA_CONSULTA, OBSERVACOES } = req.body;

        // Validação: Verificar se o médico já tem consulta a essa hora
        // (Ignora as consultas canceladas, assumindo que ID 3 = Cancelada)
        const conflito = await models.CONSULTA.findOne({
            where: {
                ID_MEDICO: ID_MEDICO,
                DATA_HORA_CONSULTA: DATA_HORA_CONSULTA,
                ID_STATUS_CONSULTA: { [Op.ne]: 3 } 
            }
        });

        if (conflito) {
            return res.status(400).send({ message: "O médico já tem uma consulta agendada para este horário." });
        }

        // Criar a consulta
        const consulta = await models.CONSULTA.create({
            ID_MEDICO,
            NUMERO_UTENTE,
            DATA_HORA_CONSULTA,
            OBSERVACOES,
            ID_STATUS_CONSULTA: 1 // Força status inicial como "Agendada"
        });

        res.status(201).send(consulta);

    } catch (error) {
        res.status(500).send({ message: "Erro ao agendar consulta: " + error.message });
    }
};

// 2. Listar Consultas (Com filtros e joins)
exports.findAll = async (req, res) => {
    try {
        const { medicoId, pacienteId, data, status } = req.query;
        let condition = {};

        // Filtros opcionais via URL
        if (medicoId) condition.ID_MEDICO = medicoId;
        if (pacienteId) condition.NUMERO_UTENTE = pacienteId;
        if (status) condition.ID_STATUS_CONSULTA = status;
        
        // Filtro por Data (Dia específico)
        if (data) {
            const startOfDay = new Date(data);
            const endOfDay = new Date(data);
            endOfDay.setHours(23, 59, 59, 999);
            condition.DATA_HORA_CONSULTA = { [Op.between]: [startOfDay, endOfDay] };
        }

        const consultas = await models.CONSULTA.findAll({
            where: condition,
            include: [
                { 
                    model: models.MEDICO,
                    as: "id_medico_medico", // Confirma este alias no init-models.js
                    include: [{
                        model: models.UTILIZADORES,
                        as: "id_user_utilizadore", 
                        attributes: ['NOME'] // Só traz o nome
                    }]
                },
                { 
                    model: models.PACIENTE,
                    as: "numero_utente_paciente", // Confirma este alias no init-models.js
                    include: [{
                        model: models.UTILIZADORES,
                        as: "id_user_utilizadore", 
                        attributes: ['NOME']
                    }]
                },
                {
                    model: models.STATUSCONSULTA,
                    as: "id_status_consulta_statusconsultum", // Confirma este alias no init-models.js
                    attributes: ['DESCRICAO_PT', 'DESCRICAO_EN']
                }
            ],
            order: [['DATA_HORA_CONSULTA', 'ASC']]
        });

        res.send(consultas);

    } catch (error) {
        res.status(500).send({ message: "Erro ao listar consultas: " + error.message });
    }
};

// 3. Detalhes de uma Consulta
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const consulta = await models.CONSULTA.findByPk(id, {
            include: [
                { model: models.TRATAMENTOREALIZADO, as: "tratamentorealizados" }, 
                { model: models.STATUSCONSULTA, as: "id_status_consulta_statusconsultum" }
            ]
        });

        if (!consulta) return res.status(404).send({ message: "Consulta não encontrada." });
        res.send(consulta);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 4. Atualizar Consulta (Mudar Status, Hora, Observações)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [num] = await models.CONSULTA.update(req.body, {
            where: { ID_CONSULTA: id }
        });

        if (num == 1) {
            res.send({ message: "Consulta atualizada com sucesso." });
        } else {
            res.send({ message: `Não foi possível atualizar a consulta com id=${id}.` });
        }

    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar consulta: " + error.message });
    }
};

// 5. Apagar Consulta
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const num = await models.CONSULTA.destroy({ where: { ID_CONSULTA: id } });

        if (num == 1) {
            res.send({ message: "Consulta apagada com sucesso!" });
        } else {
            res.send({ message: "Consulta não encontrada." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar consulta: " + error.message });
    }
};