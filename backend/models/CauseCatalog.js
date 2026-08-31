const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CauseCatalog = sequelize.define('CauseCatalog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  probabilidade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'cause_catalogs',
  timestamps: true,
});

module.exports = CauseCatalog;
