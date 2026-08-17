const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Acceso denegado: token no proporcionado'
            });
        }

        const partes = authorization.split(' ');

        if (
            partes.length !== 2 ||
            partes[0] !== 'Bearer' ||
            !partes[1]
        ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Formato de token inválido'
            });
        }

        const token = partes[1];

        const usuarioDecodificado = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = usuarioDecodificado;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                mensaje: 'El token ha expirado'
            });
        }

        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido'
        });
    }
};

module.exports = {
    verificarToken
};