const { models } = require('../config/db');

// 1. Criar novo Estado Civil
exports.create = async (req, res) => {
    try {
        const { DESCRICAO_PT, DESCRICAO_EN } = req.body;

        // Validação simples
        if (!DESCRICAO_PT) {
            return res.status(400).send({ message: "A descrição em PT é obrigatória!" });
        }

        const data = await models.ESTADOCIVIL.create({
            DESCRICAO_PT,
            DESCRICAO_EN
        });

        res.status(201).send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar: " + error.message });
    }
};

// 2. Listar todos (Ordenados por ID)
exports.findAll = async (req, res) => {
    try {
        const data = await models.ESTADOCIVIL.findAll({
            order: [['ID_ESTADO_CIVIL', 'ASC']]
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: "Erro ao listar: " + error.message });
    }
};

// 3. Obter um pelo ID
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await models.ESTADOCIVIL.findByPk(id);

        if (data) res.send(data);
        else res.status(404).send({ message: "Estado civil não encontrado." });

    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar: " + error.message });
    }
};

// 4. Atualizar
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [num] = await models.ESTADOCIVIL.update(req.body, {
            where: { ID_ESTADO_CIVIL: id }
        });

        if (num == 1) {
            res.send({ message: "Atualizado com sucesso." });
        } else {
            res.send({ message: `Não foi possível atualizar o id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar: " + error.message });
    }
};

// 5. Apagar
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const num = await models.ESTADOCIVIL.destroy({
            where: { ID_ESTADO_CIVIL: id }
        });

        if (num == 1) {
            res.send({ message: "Apagado com sucesso!" });
        } else {
            res.send({ message: "Não encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar: " + error.message });
    }
};