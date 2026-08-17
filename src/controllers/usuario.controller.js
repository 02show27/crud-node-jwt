const bcrypt = require('bcrypt');
const pool = require('../config/database');


const listarUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.execute(
            `SELECT
                id,
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                rol,
                creado_en,
                actualizado_en
             FROM usuarios
             ORDER BY id DESC`
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Usuarios obtenidos correctamente',
            cantidad: usuarios.length,
            usuarios
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al obtener los usuarios',
            error: error.message
        });
    }
};


const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del usuario no es válido'
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT
                id,
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                rol,
                creado_en,
                actualizado_en
             FROM usuarios
             WHERE id = ?`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario obtenido correctamente',
            usuario: usuarios[0]
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al obtener el usuario',
            error: error.message
        });
    }
};


const modificarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

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

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del usuario no es válido'
            });
        }

        
        const [usuarios] = await pool.execute(
            'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        
        const hayCampos = [
            paterno,
            materno,
            nombres,
            ci,
            telefono,
            correo,
            password,
            rol
        ].some((campo) => campo !== undefined);

        if (!hayCampos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe proporcionar al menos un campo para modificar'
            });
        }

       
        if (
            rol !== undefined &&
            !['administrador', 'usuario'].includes(rol)
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El rol debe ser administrador o usuario'
            });
        }

    
        if (password !== undefined && password.length < 6) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

     
        if (correo !== undefined || ci !== undefined) {
            const correoVerificar = correo
                ? correo.trim().toLowerCase()
                : usuarios[0].correo;

            const ciVerificar = ci
                ? ci.trim()
                : usuarios[0].ci;

            const [duplicados] = await pool.execute(
                `SELECT id, correo, ci
                 FROM usuarios
                 WHERE (correo = ? OR ci = ?)
                 AND id <> ?`,
                [correoVerificar, ciVerificar, id]
            );

            if (duplicados.length > 0) {
                if (duplicados[0].correo === correoVerificar) {
                    return res.status(409).json({
                        ok: false,
                        mensaje: 'El correo ya pertenece a otro usuario'
                    });
                }

                return res.status(409).json({
                    ok: false,
                    mensaje: 'El número de CI ya pertenece a otro usuario'
                });
            }
        }

        const campos = [];
        const valores = [];

        if (paterno !== undefined) {
            campos.push('paterno = ?');
            valores.push(paterno.trim());
        }

        if (materno !== undefined) {
            campos.push('materno = ?');
            valores.push(materno.trim());
        }

        if (nombres !== undefined) {
            campos.push('nombres = ?');
            valores.push(nombres.trim());
        }

        if (ci !== undefined) {
            campos.push('ci = ?');
            valores.push(ci.trim());
        }

        if (telefono !== undefined) {
            campos.push('telefono = ?');
            valores.push(telefono.trim());
        }

        if (correo !== undefined) {
            campos.push('correo = ?');
            valores.push(correo.trim().toLowerCase());
        }

        if (rol !== undefined) {
            campos.push('rol = ?');
            valores.push(rol);
        }

        // Si cambia la contraseña, se vuelve a cifrar
        if (password !== undefined) {
            const passwordCifrado = await bcrypt.hash(password, 12);

            campos.push('password = ?');
            valores.push(passwordCifrado);
        }

        valores.push(id);

        await pool.execute(
            `UPDATE usuarios
             SET ${campos.join(', ')}
             WHERE id = ?`,
            valores
        );

        // Obtener datos actualizados sin exponer la contraseña
        const [usuarioActualizado] = await pool.execute(
            `SELECT
                id,
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                rol,
                creado_en,
                actualizado_en
             FROM usuarios
             WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario modificado correctamente',
            usuario: usuarioActualizado[0]
        });
    } catch (error) {
        console.error('Error al modificar usuario:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                ok: false,
                mensaje: 'El correo o el CI ya están registrados'
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al modificar el usuario',
            error: error.message
        });
    }
};


const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del usuario no es válido'
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT
                id,
                paterno,
                materno,
                nombres,
                ci,
                telefono,
                correo,
                rol
             FROM usuarios
             WHERE id = ?`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado correctamente',
            usuarioEliminado: usuarios[0]
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al eliminar el usuario',
            error: error.message
        });
    }
};

module.exports = {
    listarUsuarios,
    obtenerUsuarioPorId,
    modificarUsuario,
    eliminarUsuario
};