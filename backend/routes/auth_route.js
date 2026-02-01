const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth_controller');
const { verifyToken } = require('../middleware/authJwt');

router.post('/login', controller.login);
router.post('/change-password', verifyToken, controller.changePassword);

module.exports = router;
