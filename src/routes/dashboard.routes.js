const express = require('express');
const {
    verificarToken
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verificarToken, (req, res) => {
    return res.status(200).json({
        ok: true,
        mensaje: `¡Bienvenido al dashboard, ${req.usuario.nombres}!`,
        usuario: {
            id: req.usuario.id,
            nombres: req.usuario.nombres,
            correo: req.usuario.correo,
            rol: req.usuario.rol
        }
    });
});

module.exports = router;