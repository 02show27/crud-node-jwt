const sequelize = require('../config/sequelize');
const Usuario = require('./Usuario');
const Complementario = require('./Complementario');

Usuario.hasOne(Complementario, {
    foreignKey: 'usuario_id',
    as: 'complementario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Complementario.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = {
    sequelize,
    Usuario,
    Complementario
};