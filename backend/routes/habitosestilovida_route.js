const express = require('express');
const router = express.Router();
const controller = require('../controllers/habitosestilovida_controller');
const { verifyToken } = require('../middleware/authJwt');

// PROTEGER TODAS AS ROTAS (Dados Clínicos)
router.use(verifyToken);

// Criar novo registo
router.post('/', controller.create);

// Listar todos os registos de um paciente (Ex: /api/habitos/paciente/123456789)
router.get('/paciente/:utenteId', controller.findByPaciente);

// Operações num registo específico (pelo ID do hábito)
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;