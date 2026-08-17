const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Complementario = sequelize.define(
    'Complementario',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        usuario_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true
        },
        edad: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            validate: {
                min: 1,
                max: 120
            }
        },
        ci: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        departamento: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        municipio: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        tableName: 'complementarios',
        timestamps: true,
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en'
    }
);

module.exports = Complementario;