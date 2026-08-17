const express = require('express');
const {
    registrarUsuario
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/registro', registrarUsuario);

module.exports = router;