const express = require('express');
const router = express.Router();
const controller = require('../controllers/historicomedico_controller');
const { verifyToken } = require('../middleware/authJwt');

/**
 * @openapi
 * tags:
 *   - name: HistoricoMedico
 *     description: Endpoints para histórico médico
 */

router.use(verifyToken);
router.get('/', controller.findAll);
router.post('/', controller.create);
router.get('/paciente/:utenteId', controller.findByPaciente);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
