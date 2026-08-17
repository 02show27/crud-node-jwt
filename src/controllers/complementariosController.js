const PDFDocument = require('pdfkit');

const {
    Usuario,
    Complementario
} = require('../models');


const crearComplementario = async (req, res) => {
    try {
        const {
            usuario_id,
            edad,
            ci,
            direccion,
            departamento,
            municipio
        } = req.body;

        if (
            !usuario_id ||
            edad === undefined ||
            !ci ||
            !direccion ||
            !departamento ||
            !municipio
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los datos complementarios son obligatorios'
            });
        }

        const edadNumero = Number(edad);

        if (
            !Number.isInteger(edadNumero) ||
            edadNumero < 1 ||
            edadNumero > 120
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La edad debe ser un número entero entre 1 y 120'
            });
        }

        const usuario = await Usuario.findByPk(usuario_id);

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El usuario relacionado no existe'
            });
        }

        if (usuario.ci !== ci.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El CI no coincide con el usuario seleccionado'
            });
        }

        const registroExistente = await Complementario.findOne({
            where: {
                usuario_id
            }
        });

        if (registroExistente) {
            return res.status(409).json({
                ok: false,
                mensaje: 'El usuario ya tiene datos complementarios'
            });
        }

        const complementario = await Complementario.create({
            usuario_id,
            edad: edadNumero,
            ci: ci.trim(),
            direccion: direccion.trim(),
            departamento: departamento.trim(),
            municipio: municipio.trim()
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Datos complementarios creados correctamente',
            complementario
        });
    } catch (error) {
        console.error('Error al crear datos complementarios:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                ok: false,
                mensaje: 'El usuario o CI ya tiene datos complementarios'
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al crear los datos complementarios',
            error: error.message
        });
    }
};


const listarComplementarios = async (req, res) => {
    try {
        const registros = await Complementario.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: [
                        'id',
                        'paterno',
                        'materno',
                        'nombres',
                        'telefono',
                        'correo',
                        'rol'
                    ]
                }
            ],
            order: [['id', 'DESC']]
        });

        return res.status(200).json({
            ok: true,
            mensaje: 'Datos complementarios obtenidos correctamente',
            cantidad: registros.length,
            complementarios: registros
        });
    } catch (error) {
        console.error('Error al listar datos complementarios:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al obtener los datos complementarios',
            error: error.message
        });
    }
};


const obtenerComplementarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const complementario = await Complementario.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: {
                        exclude: ['password']
                    }
                }
            ]
        });

        if (!complementario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Datos complementarios no encontrados'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Datos complementarios obtenidos correctamente',
            complementario
        });
    } catch (error) {
        console.error('Error al obtener datos complementarios:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al obtener los datos complementarios',
            error: error.message
        });
    }
};


const modificarComplementario = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            edad,
            direccion,
            departamento,
            municipio
        } = req.body;

        const complementario = await Complementario.findByPk(id);

        if (!complementario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Datos complementarios no encontrados'
            });
        }

        if (edad !== undefined) {
            const edadNumero = Number(edad);

            if (
                !Number.isInteger(edadNumero) ||
                edadNumero < 1 ||
                edadNumero > 120
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La edad debe ser un número entero entre 1 y 120'
                });
            }

            complementario.edad = edadNumero;
        }

        if (direccion !== undefined) {
            complementario.direccion = direccion.trim();
        }

        if (departamento !== undefined) {
            complementario.departamento = departamento.trim();
        }

        if (municipio !== undefined) {
            complementario.municipio = municipio.trim();
        }

        await complementario.save();

        return res.status(200).json({
            ok: true,
            mensaje: 'Datos complementarios modificados correctamente',
            complementario
        });
    } catch (error) {
        console.error('Error al modificar datos complementarios:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al modificar los datos complementarios',
            error: error.message
        });
    }
};


const eliminarComplementario = async (req, res) => {
    try {
        const { id } = req.params;

        const complementario = await Complementario.findByPk(id);

        if (!complementario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Datos complementarios no encontrados'
            });
        }

        const datosEliminados = complementario.toJSON();

        await complementario.destroy();

        return res.status(200).json({
            ok: true,
            mensaje: 'Datos complementarios eliminados correctamente',
            complementarioEliminado: datosEliminados
        });
    } catch (error) {
        console.error('Error al eliminar datos complementarios:', error);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error interno al eliminar los datos complementarios',
            error: error.message
        });
    }
};


const generarPdfComplementario = async (req, res) => {
    try {
        const { id } = req.params;

        const complementario = await Complementario.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: {
                        exclude: ['password']
                    }
                }
            ]
        });

        if (!complementario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Datos complementarios no encontrados'
            });
        }

        const usuario = complementario.usuario;

        const documento = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Reporte de datos complementarios',
                Author: 'Jhonny Tito Castro'
            }
        });

        const nombreArchivo =
            `datos-complementarios-${usuario.ci}.pdf`;

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        res.setHeader(
            'Content-Disposition',
            `inline; filename="${nombreArchivo}"`
        );

        documento.pipe(res);

        documento
            .fontSize(20)
            .text(
                'REPORTE DE DATOS PERSONALES Y COMPLEMENTARIOS',
                {
                    align: 'center'
                }
            );

        documento.moveDown(2);

        documento
            .fontSize(15)
            .text('DATOS DEL USUARIO', {
                underline: true
            });

        documento.moveDown();

        documento.fontSize(12);

        documento.text(`ID: ${usuario.id}`);
        documento.text(`Paterno: ${usuario.paterno}`);
        documento.text(`Materno: ${usuario.materno}`);
        documento.text(`Nombres: ${usuario.nombres}`);
        documento.text(`CI: ${usuario.ci}`);
        documento.text(`Teléfono: ${usuario.telefono}`);
        documento.text(`Correo: ${usuario.correo}`);
        documento.text(`Rol: ${usuario.rol}`);

        documento.moveDown(2);

        documento
            .fontSize(15)
            .text('DATOS COMPLEMENTARIOS', {
                underline: true
            });

        documento.moveDown();

        documento.fontSize(12);

        documento.text(`Edad: ${complementario.edad} años`);
        documento.text(`CI complementario: ${complementario.ci}`);
        documento.text(`Dirección: ${complementario.direccion}`);
        documento.text(
            `Departamento: ${complementario.departamento}`
        );
        documento.text(`Municipio: ${complementario.municipio}`);

        documento.moveDown(3);

        documento
            .fontSize(10)
            .fillColor('#555555')
            .text(
                `Documento generado: ${new Date().toLocaleString('es-BO')}`,
                {
                    align: 'right'
                }
            );

        documento.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);

        if (!res.headersSent) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno al generar el PDF',
                error: error.message
            });
        }
    }
};

module.exports = {
    crearComplementario,
    listarComplementarios,
    obtenerComplementarioPorId,
    modificarComplementario,
    eliminarComplementario,
    generarPdfComplementario
};