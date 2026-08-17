const express = require('express');

const {
    crearComplementario,
    listarComplementarios,
    obtenerComplementarioPorId,
    modificarComplementario,
    eliminarComplementario,
    generarPdfComplementario
} = require('../controllers/complementariosController');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const router = express.Router();


router.use(verificarToken);

router.post('/', crearComplementario);
router.get('/', listarComplementarios);

// La ruta PDF debe estar antes de /:id
router.get('/:id/pdf', generarPdfComplementario);

router.get('/:id', obtenerComplementarioPorId);
router.put('/:id', modificarComplementario);
router.delete('/:id', eliminarComplementario);

module.exports = router;