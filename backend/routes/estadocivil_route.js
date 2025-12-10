const express = require('express');
const router = express.Router();
const controller = require('../controllers/estadocivil_controller');
const { verifyToken } = require('../middleware/authJwt');

// --- Rotas Públicas (Qualquer um pode ler) ---
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);

// --- Rotas Protegidas (Só Admin/Login pode alterar) ---
router.post('/', [verifyToken], controller.create);
router.put('/:id', [verifyToken], controller.update);
router.delete('/:id', [verifyToken], controller.delete);

module.exports = router;