const express = require('express');
const router = express.Router();
const controller = require('../controllers/paciente_controller');
const { verifyToken } = require('../middleware/authJwt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const docsController = require('../controllers/paciente_documentos_controller');

/**
 * @openapi
 * tags:
 *   - name: Paciente
 *     description: Endpoints para pacientes
 */

router.use(verifyToken);

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, '..', 'uploads', 'tmp');
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}.upload`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

router.get('/', controller.findAll);
router.post('/', controller.create);

// Documentos (PDF) do paciente
router.get('/:id/documentos', docsController.list);
router.post(
	'/:id/documentos',
	(req, res, next) => {
		upload.single('file')(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message || 'Upload inválido.' });
			next();
		});
	},
	docsController.upload
);
router.get('/:id/documentos/:docId', docsController.download);
router.delete('/:id/documentos/:docId', docsController.delete);

router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
