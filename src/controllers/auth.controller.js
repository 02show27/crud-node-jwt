const bcrypt = require('bcrypt');
const pool = require('../config/database');

const registrarUsuario = async (req, res) => {
    try {
        const {
            paterno,
            materno,
            nombres,
            ci,
            telefono,
            correo,
            password,
            rol
        } = req.body;

        // Validar campos obligatorios
        if (
            !paterno ||
            !materno ||
            !nombres ||
            !ci ||
            !telefono ||
            !correo ||
            !password ||
            !rol
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Validar rol
        const rolesPermitidos = ['administrador', 'usuario'];

        if (!rolesPermitidos.includes(rol)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El rol debe ser administrador o usuario'
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Comprobar correo y CI duplicados
        const [usuariosExistentes] = await pool.execute(
            `SELECT id, correo, ci
             FROM usuarios
             WHERE correo = ? OR ci = ?`,
            [correo, ci]
        );

        if (usuariosExistentes.length > 0) {
            const usuarioExistente = usuariosExistentes[0];

            if (usuarioExistente.correo === correo) {
                return res.status(409).json({
                    ok: false,
                    mensaje: 'El correo ya se encuentra registrado'
                });
            }

            if (usuarioExistente.ci === ci) {
                return res.status(409).json({
                    ok: false,
                    mensaje: 'El número de CI ya se encuentra registrado'
                });
            }
        }

        // Cifrar contraseña
        const saltRounds = 12;
        const passwordCifrado = await bcrypt.hash(
            password,
            saltRounds
        );

        // Guardar usuario
        const [resultado] = await pool.execute(
            `INSERT INTO usuarios
            (
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                password,
                rol
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                paterno.trim(),
                materno.trim(),
                nombres.trim(),
                ci.trim(),
                telefono.trim(),
                correo.trim().toLowerCase(),
                passwordCifrado,
                rol
            ]
        );

        return res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado correctamente',
            usuario: {
                id: resultado.insertId,
                paterno: paterno.trim(),
                materno: materno.trim(),
                nombres: nombres.trim(),
                ci: ci.trim(),
                telefono: telefono.trim(),
                correo: correo.trim().toLowerCase(),
                rol
            }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                ok: false,
                mensaje: 'El correo o CI ya está registrado'
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al registrar el usuario',
            error: error.message
        });
    }
};

module.exports = {
    registrarUsuario
};