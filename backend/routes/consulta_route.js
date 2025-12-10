const express = require('express');
const router = express.Router();
const controller = require('../controllers/consulta_controller'); 
const { verifyToken } = require('../middleware/authJwt');

/**
 * @openapi
 * tags:
 *   - name: Consulta
 *     description: Endpoints para gerir consultas
 */

/**
 * @openapi
 * /consulta:
 *   get:
 *     summary: Lista todas as consultas
 *     tags: [Consulta]
 *     responses:
 *       200:
 *         description: Lista de consultas
 */

/**
 * @openapi
 * /consulta:
 *   post:
 *     summary: Cria uma nova consulta
 *     tags: [Consulta]
 *     responses:
 *       201:
 *         description: Consulta criada
 */

/**
 * @openapi
 * /consulta/{id}:
 *   get:
 *     summary: Obtém uma consulta por id
 *     tags: [Consulta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da consulta
 */

/**
 * @openapi
 * /consulta/{id}:
 *   put:
 *     summary: Atualiza uma consulta por id
 *     tags: [Consulta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consulta atualizada
 */

/**
 * @openapi
 * /consulta/{id}:
 *   delete:
 *     summary: Apaga uma consulta por id
 *     tags: [Consulta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Consulta apagada
 */

// Protege todas as rotas de consulta (Login obrigatório)
router.use(verifyToken);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;