const { models } = require('../config/db');

// 1. Criar nova Especialidade
exports.create = async (req, res) => {
    try {
        const { DESCRICAO_PT, DESCRICAO_EN } = req.body;

        if (!DESCRICAO_PT) {
            return res.status(400).send({ message: "A descrição em PT é obrigatória!" });
        }

        const data = await models.ESPECIALIDADE.create({
            DESCRICAO_PT,
            DESCRICAO_EN
        });

        res.status(201).send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar especialidade: " + error.message });
    }
};

// 2. Listar todas
exports.findAll = async (req, res) => {
    try {
        const data = await models.ESPECIALIDADE.findAll({
            order: [['DESCRICAO_PT', 'ASC']]
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao listar: " + error.message });
    }
};

// 3. Obter uma
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await models.ESPECIALIDADE.findByPk(id);

        if (data) res.send(data);
        else res.status(404).send({ message: "Especialidade não encontrada." });

    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar: " + error.message });
    }
};

// 4. Atualizar
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [num] = await models.ESPECIALIDADE.update(req.body, {
            where: { ID_ESPECIALIDADE: id }
        });

        if (num == 1) res.send({ message: "Especialidade atualizada com sucesso." });
        else res.send({ message: `Não foi possível atualizar o id=${id}.` });

    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar: " + error.message });
    }
};

// 5. Apagar
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const num = await models.ESPECIALIDADE.destroy({
            where: { ID_ESPECIALIDADE: id }
        });

        if (num == 1) res.send({ message: "Especialidade apagada com sucesso!" });
        else res.send({ message: "Especialidade não encontrada." });

    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar: " + error.message });
    }
};