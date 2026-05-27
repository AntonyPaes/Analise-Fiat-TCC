const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cause = sequelize.define('Cause', {
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
  }
}, {
  tableName: 'causes',
  timestamps: true,
});

module.exports = Cause;
