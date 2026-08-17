const bcrypt = require('bcrypt');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
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

       
        const rolesPermitidos = ['administrador', 'usuario'];

        if (!rolesPermitidos.includes(rol)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El rol debe ser administrador o usuario'
            });
        }

    
        if (password.length < 6) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            });
        }


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

       
        const saltRounds = 12;
        const passwordCifrado = await bcrypt.hash(
            password,
            saltRounds
        );

  
const nuevoUsuario = await Usuario.create({
    paterno: paterno.trim(),
    materno: materno.trim(),
    nombres: nombres.trim(),
    ci: ci.trim(),
    telefono: telefono.trim(),
    correo: correo.trim().toLowerCase(),
    password: passwordCifrado,
    rol
});

        return res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado correctamente',
            usuario: {
                id: nuevoUsuario.id,
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

        if (error.code === 'ER_DUP_ENTRY' ||error.name === 'SequelizeUniqueConstraintError') 
        {
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

const iniciarSesion = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Validar datos obligatorios
        if (!correo || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // Buscar usuario por correo
        const [usuarios] = await pool.execute(
            `SELECT
                id,
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                password,
                rol
             FROM usuarios
             WHERE correo = ?`,
            [correo.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuarios[0];

        // Comparar contraseña con bcrypt
        const passwordValido = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValido) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        
        const token = jwt.sign(
            {
                id: usuario.id,
                correo: usuario.correo,
                nombres: usuario.nombres,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '2h'
            }
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Autenticación exitosa',
            token,
            usuario: {
                id: usuario.id,
                paterno: usuario.paterno,
                materno: usuario.materno,
                nombres: usuario.nombres,
                ci: usuario.ci,
                telefono: usuario.telefono,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al iniciar sesión',
            error: error.message
        });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion
};