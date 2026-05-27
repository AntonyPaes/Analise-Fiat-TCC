const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Symptom = sequelize.define('Symptom', {
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
  codigo_obd: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Pendente',
  }
}, {
  tableName: 'symptoms',
  timestamps: true,
});

module.exports = Symptom;
