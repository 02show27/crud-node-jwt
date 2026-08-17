require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const complementariosRoutes = require('./routes/complementarios.routes');

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Prueba de conexión
app.get('/api/prueba', async (req, res) => {
    try {
        const [resultado] = await pool.query(
            'SELECT NOW() AS fechaServidor'
        );

        res.status(200).json({
            ok: true,
            mensaje: 'Servidor y base de datos funcionando correctamente',
            fecha: resultado[0].fechaServidor
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'No se pudo conectar con la base de datos',
            error: error.message
        });
    }
});
// Ruta de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/complementarios',complementariosRoutes);

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: 'Ruta no encontrada'
    });
});

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log(
            'Modelos sincronizados correctamente con MariaDB'
        );

        app.listen(PORT, () => {
            console.log(
                `Servidor está corriendo en el puerto ${PORT}`
            );
            console.log(
                `URL: http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            'Error de conexión o sincronización:',
            error
        );
    });