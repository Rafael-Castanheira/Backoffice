const express = require('express');
const router = express.Router();
const controller = require('../controllers/med_spec_controller');
const { verifyToken } = require('../middleware/authJwt');

router.use(verifyToken);
router.get('/', controller.findAll);
router.post('/', controller.create);
// Composite key route
router.get('/:medicoId/:especialidadeId', controller.findOne);
router.delete('/:medicoId/:especialidadeId', controller.delete);

module.exports = router;
