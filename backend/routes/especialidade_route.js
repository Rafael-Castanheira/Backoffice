const express = require('express');
const router = express.Router();
const controller = require('../controllers/especialidade_controller');
const { verifyToken } = require('../middleware/authJwt');

// Listar e Ver Detalhes (Público - útil para o registo)
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);

// Criar, Editar, Apagar (Protegido - Só Admin)
router.post('/', [verifyToken], controller.create);
router.put('/:id', [verifyToken], controller.update);
router.delete('/:id', [verifyToken], controller.delete);

module.exports = router;