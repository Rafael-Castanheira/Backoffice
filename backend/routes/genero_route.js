const express = require('express');
const router = express.Router();
const controller = require('../controllers/genero_controller');
const { verifyToken } = require('../middleware/authJwt');

// --- Rotas Públicas ---
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);

// --- Rotas Protegidas (Requer Login) ---
router.post('/', [verifyToken], controller.create);
router.put('/:id', [verifyToken], controller.update);
router.delete('/:id', [verifyToken], controller.delete);

module.exports = router;