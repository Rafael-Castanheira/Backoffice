const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificacao_controller');
const { verifyToken } = require('../middleware/authJwt');

/**
 * @openapi
 * tags:
 *   - name: Notificacao
 *     description: Endpoints para notificações
 */

router.use(verifyToken);
router.get('/', controller.findAll);
router.post('/', controller.create);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
