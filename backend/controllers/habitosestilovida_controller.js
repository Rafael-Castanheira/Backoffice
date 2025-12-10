const { models } = require('../config/db');

// 1. Criar novo registo de Hábitos
exports.create = async (req, res) => {
    try {
        const { NUMERO_UTENTE, HIGIENE_ORAL, HABITOS_ALIMENTARES, CONSUMO_SUBSTANCIAS, BRUXISMO, ATIVIDADES_DESPORTIVAS } = req.body;

        if (!NUMERO_UTENTE) {
            return res.status(400).send({ message: "O Número de Utente é obrigatório!" });
        }

        const data = await models.HABITOSESTILOVIDA.create({
            NUMERO_UTENTE,
            HIGIENE_ORAL,
            HABITOS_ALIMENTARES,
            CONSUMO_SUBSTANCIAS,
            BRUXISMO, // Boolean
            ATIVIDADES_DESPORTIVAS
        });

        res.status(201).send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar registo: " + error.message });
    }
};

// 2. Listar histórico de UM Paciente específico
exports.findByPaciente = async (req, res) => {
    try {
        const { utenteId } = req.params;

        const data = await models.HABITOSESTILOVIDA.findAll({
            where: { NUMERO_UTENTE: utenteId },
            order: [['DATA_REGISTO', 'DESC']] // Mostra os mais recentes primeiro
        });
        
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao listar histórico: " + error.message });
    }
};

// 3. Obter um registo específico pelo ID (do hábito, não do paciente)
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await models.HABITOSESTILOVIDA.findByPk(id);

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
        const [num] = await models.HABITOSESTILOVIDA.update(req.body, {
            where: { ID_HABITO: id }
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
        const num = await models.HABITOSESTILOVIDA.destroy({
            where: { ID_HABITO: id }
        });

        if (num == 1) res.send({ message: "Apagado com sucesso!" });
        else res.send({ message: "Não encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};