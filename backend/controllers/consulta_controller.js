const db = require('../models');
const { Op } = require('sequelize');

const consulta = db.consulta;

// 1. Agendar Consulta
exports.create = async (req, res) => {
  try {
    const { id_medico, numero_utente, data_hora_consulta, observacoes } = req.body;

    // valida existência do médico
    const medico = await db.medico.findByPk(id_medico);
    if (!medico) {
      return res.status(400).send({ message: "Médico não encontrado (id_medico inválido)." });
    }

    // valida conflito existente (mantém a sua lógica)
    const conflito = await consulta.findOne({
      where: {
        id_medico,
        data_hora_consulta,
        id_status_consulta: { [Op.ne]: 3 }
      }
    });
    if (conflito) {
      return res.status(400).send({ message: "O médico já tem uma consulta agendada para esta data." });
    }

    const result = await consulta.create({
      id_medico,
      numero_utente,
      data_hora_consulta,
      observacoes,
      id_status_consulta: 1
    });

    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Erro ao agendar consulta: " + error.message });
  }
};

// 2. Listar Consultas
exports.findAll = async (req, res) => {
    try {
        const result = await consulta.findAll();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Erro ao listar consultas: " + error.message });
    }
};

// 3. Detalhes de uma Consulta
exports.findOne = async (req, res) => {
    try {
        const result = await consulta.findByPk(req.params.id);
        if (!result) return res.status(404).send({ message: "Consulta não encontrada." });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 4. Atualizar Consulta
exports.update = async (req, res) => {
    try {
        const [num] = await consulta.update(req.body, {
            where: { id_consulta: req.params.id }
        });
        if (num === 1) {
            res.send({ message: "Consulta atualizada com sucesso." });
        } else {
            res.status(404).send({ message: "Consulta não encontrada." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar consulta: " + error.message });
    }
};

// 5. Apagar Consulta
exports.delete = async (req, res) => {
    try {
        const num = await consulta.destroy({
            where: { id_consulta: req.params.id }
        });
        if (num === 1) {
            res.send({ message: "Consulta apagada com sucesso!" });
        } else {
            res.status(404).send({ message: "Consulta não encontrada." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar consulta: " + error.message });
    }
};