const express = require('express');

const {
    listarUsuarios,
    obtenerUsuarioPorId,
    modificarUsuario,
    eliminarUsuario
} = require('../controllers/usuario.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación JWT
router.use(verificarToken);

router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', modificarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;