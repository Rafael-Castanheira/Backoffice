const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consulta_controller');


router.get('/', consultaController.findAll);
router.post('/', consultaController.create);
router.get('/:id', consultaController.findOne);
router.put('/:id', consultaController.update);
router.delete('/:id', consultaController.delete);

module.exports = router;