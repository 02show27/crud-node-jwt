const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = sequelize.define(
    'Usuario',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        paterno: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        materno: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        nombres: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        ci: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        rol: {
            type: DataTypes.ENUM('administrador', 'usuario'),
            allowNull: false,
            defaultValue: 'usuario'
        }
    },
    {
        tableName: 'usuarios',
        timestamps: true,
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en'
    }
);

module.exports = Usuario;